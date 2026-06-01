import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendWelcomeEmail } from "@/lib/emails/welcome";
import { sendNudgeEmail } from "@/lib/emails/nudge";
import { sendConvertEmail } from "@/lib/emails/convert";

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

    const now = new Date();
    const threeDaysAgoStart = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    threeDaysAgoStart.setHours(0, 0, 0, 0);
    const threeDaysAgoEnd = new Date(threeDaysAgoStart);
    threeDaysAgoEnd.setHours(23, 59, 59, 999);

    const sevenDaysAgoStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    sevenDaysAgoStart.setHours(0, 0, 0, 0);
    const sevenDaysAgoEnd = new Date(sevenDaysAgoStart);
    sevenDaysAgoEnd.setHours(23, 59, 59, 999);

    const oneDayAgoStart = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    oneDayAgoStart.setHours(0, 0, 0, 0);
    const oneDayAgoEnd = new Date(oneDayAgoStart);
    oneDayAgoEnd.setHours(23, 59, 59, 999);

    // 0. Day 1 Welcome
    const { data: day1Users } = await supabase
      .from("users")
      .select("id, email")
      .gte("created_at", oneDayAgoStart.toISOString())
      .lte("created_at", oneDayAgoEnd.toISOString());

    if (day1Users) {
      for (const user of day1Users) {
        if (!user.email) continue;
        await sendWelcomeEmail({ to: user.email });
      }
    }

    // 1. Day 3 Nudge
    const { data: day3Users } = await supabase
      .from("users")
      .select("id, email")
      .gte("created_at", threeDaysAgoStart.toISOString())
      .lte("created_at", threeDaysAgoEnd.toISOString());

    if (day3Users) {
      for (const user of day3Users) {
        if (!user.email) continue;
        
        // Count active payments
        const { count } = await supabase
          .from("payments")
          .select("*", { count: 'exact', head: true })
          .eq("user_id", user.id)
          .neq("status", "paid");

        await sendNudgeEmail({ 
          to: user.email, 
          upcomingCount: count || 0 
        });
      }
    }

    // 2. Day 7 Convert
    const { data: day7Users } = await supabase
      .from("users")
      .select("id, email")
      .eq("is_pro", false)
      .gte("created_at", sevenDaysAgoStart.toISOString())
      .lte("created_at", sevenDaysAgoEnd.toISOString());

    if (day7Users) {
      for (const user of day7Users) {
        if (!user.email) continue;
        await sendConvertEmail({ to: user.email });
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: {
        day1: day1Users?.length || 0,
        day3: day3Users?.length || 0,
        day7: day7Users?.length || 0
      }
    });
  } catch (error: any) {
    console.error("Onboarding cron error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
