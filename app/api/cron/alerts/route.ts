import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendAlertEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // Validate Vercel Cron authorization header
    const authHeader = request.headers.get("authorization");
    if (
      process.env.NODE_ENV === "production" &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Using service role key for system-level batch querying
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const now = new Date();
    const fortyEightHoursLater = new Date(now.getTime() + 86400000 * 2);

    // Fetch payments due in the next 48 hours
    const { data: upcomingPayments, error } = await supabase
      .from("payments")
      .select(`
        id,
        item_name,
        amount_due,
        due_date,
        provider,
        user_id,
        late_fee,
        users:user_id ( email )
      `)
      .neq("status", "paid")
      .gte("due_date", now.toISOString())
      .lte("due_date", fortyEightHoursLater.toISOString());

    if (error) {
      console.error("Cron Alerts DB Error:", error);
      return NextResponse.json({ error: "Failed to query database" }, { status: 500 });
    }

    const alertsSent = [];

    // Trigger alert email simulation for each record
    if (upcomingPayments && upcomingPayments.length > 0) {
      for (const payment of upcomingPayments) {
        const userEmail = (payment.users as any)?.email;
        if (userEmail) {
          const ficoImpact = payment.late_fee ? Math.min(40, Math.round(Number(payment.late_fee) * 2.5)) : 15;
          
          await sendAlertEmail({
            to: userEmail,
            provider: payment.provider,
            amount: Number(payment.amount_due),
            dueDate: payment.due_date,
            ficoImpact,
          });

          // Mark alert as sent to avoid spam
          await supabase
            .from("payments")
            .update({ alert_sent_48h: true })
            .eq("id", payment.id);

          alertsSent.push({
            paymentId: payment.id,
            userEmail,
            provider: payment.provider,
            amount: payment.amount_due,
          });
        }
      }
    }

    return NextResponse.json({
      status: "success",
      timestamp: new Date().toISOString(),
      alerts_sent: alertsSent.length,
      alerts: alertsSent,
    });
  } catch (error: any) {
    console.error("Cron handler failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
