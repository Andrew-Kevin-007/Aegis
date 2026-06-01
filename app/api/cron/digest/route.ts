import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendDigestEmail } from "@/lib/emails/digest";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get all users
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, email, total_fees_prevented");

    if (usersError || !users) throw new Error("Failed to fetch users");

    let emailsSent = 0;

    for (const user of users) {
      if (!user.email) continue;

      // Get all active payments for this user
      const { data: payments } = await supabase
        .from("payments")
        .select("amount_due, due_date")
        .eq("user_id", user.id)
        .neq("status", "paid");

      if (!payments || payments.length === 0) continue;

      const totalExposure = payments.reduce((sum, p) => sum + Number(p.amount_due), 0);
      
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const upcomingThisWeek = payments.filter((p) => {
        const dueDate = new Date(p.due_date);
        return dueDate >= now && dueDate <= nextWeek;
      }).length;

      // Only send digest if there's actual exposure or upcoming payments
      if (totalExposure > 0 || upcomingThisWeek > 0) {
        await sendDigestEmail({
          to: user.email,
          exposure: totalExposure,
          prevented: Number(user.total_fees_prevented) || 0,
          upcoming: upcomingThisWeek
        });
        emailsSent++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      emailsSent 
    });
  } catch (error: any) {
    console.error("Digest cron error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
