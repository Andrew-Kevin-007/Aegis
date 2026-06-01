import { NextResponse } from "next/server";
import { extractPaymentsFromImage } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    const body = await request.json();
    const { imageBase64, mimeType } = body;

    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    // Check pro status and enforce scan limits
    const { data: profile } = await supabase
      .from("users")
      .select("is_pro, scan_count_today, scan_date")
      .eq("id", user.id)
      .single();

    const today = new Date().toISOString().split("T")[0];
    const isPro = profile?.is_pro === true;
    let scanCountToday = profile?.scan_count_today || 0;
    const scanDate = profile?.scan_date;

    // Reset count if it's a new day
    if (scanDate !== today) {
      scanCountToday = 0;
    }

    // Free tier: 3 scans/day. Pro: unlimited
    if (!isPro && scanCountToday >= 3) {
      return NextResponse.json(
        { error: "Free tier limit reached (3 scans/day). Upgrade to Pro for unlimited scans." },
        { status: 429 }
      );
    }

    // Increment scan count
    await supabase
      .from("users")
      .update({ scan_count_today: scanCountToday + 1, scan_date: today })
      .eq("id", user.id);

    // Call Gemini AI
    const payments = await extractPaymentsFromImage(imageBase64, mimeType);

    // Duplicate detection: check existing payments for this user
    const { data: existingPayments } = await supabase
      .from("payments")
      .select("provider, item_name, amount_due, due_date")
      .eq("user_id", user.id)
      .neq("status", "paid");

    const existingSet = new Set(
      (existingPayments || []).map(
        (p) => `${p.provider}|${p.item_name}|${p.amount_due}|${p.due_date}`
      )
    );

    const newPayments = payments.filter(
      (p) => !existingSet.has(`${p.provider}|${p.item_name}|${p.amount_due}|${p.due_date}`)
    );

    if (newPayments.length === 0) {
      return NextResponse.json({
        payments: [],
        duplicates_skipped: payments.length,
        message: "All extracted payments already exist in your dashboard.",
        extracted_at: new Date().toISOString(),
      });
    }

    // Insert only new payments
    const dbInserts = newPayments.map((payment) => ({
      user_id: user.id,
      provider: payment.provider,
      item_name: payment.item_name,
      amount_due: payment.amount_due,
      currency: payment.currency,
      due_date: payment.due_date,
      late_fee: payment.late_fee,
      status: payment.status,
    }));

    const { error: dbError } = await supabase
      .from("payments")
      .insert(dbInserts);

    if (dbError) {
      console.error("Database Insert Error:", dbError);
      return NextResponse.json({ error: "Failed to save extracted data." }, { status: 500 });
    }

    return NextResponse.json({
      payments: newPayments,
      duplicates_skipped: payments.length - newPayments.length,
      extracted_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("API /extract error:", error);
    return NextResponse.json(
      { error: "Could not read this screenshot. Try a clearer image." },
      { status: 500 }
    );
  }
}
