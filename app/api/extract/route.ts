import { NextResponse } from "next/server";
import { extractPaymentsFromImage } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/encryption";

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

    // Check tier and enforce scan limits
    const { data: profile } = await supabase
      .from("users")
      .select("tier, scan_count_today, scan_date")
      .eq("id", user.id)
      .single();

    const today = new Date().toISOString().split("T")[0];
    const tier = profile?.tier || "free";
    let scanCountToday = profile?.scan_count_today || 0;
    const scanDate = profile?.scan_date;

    // Reset count if it's a new day
    if (scanDate !== today) {
      scanCountToday = 0;
    }

    // Free tier: 1 scan/day. Pro/Elite: unlimited
    if (tier === "free" && scanCountToday >= 1) {
      return NextResponse.json(
        { error: "Free tier limit reached (1 scan/day). Upgrade to Pro for unlimited scans." },
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

    // We don't check duplicates on encrypted data easily via DB query.
    // In production, we'd hash a deterministic signature for deduplication.
    // For now, assume all extracted are new or let the user delete duplicates.
    
    // Insert with AES-256 encryption
    const dbInserts = payments.map((payment) => ({
      user_id: user.id,
      provider_name: encrypt(payment.provider || payment.item_name || "Unknown"),
      amount_due: encrypt(payment.amount_due.toString()),
      currency: payment.currency,
      due_date: payment.due_date,
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
      payments: payments,
      duplicates_skipped: 0,
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
