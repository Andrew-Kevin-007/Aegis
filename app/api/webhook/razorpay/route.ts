import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify HMAC signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (webhookSecret) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("hex");

      if (signature !== expectedSignature) {
        console.error("Razorpay webhook signature mismatch");
        return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
      }
    }

    const payload = JSON.parse(body);
    const event = payload.event;

    if (event === "order.paid" || event === "payment.captured") {
      // Use service role key to bypass RLS
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const paymentEntity = payload.payload.payment?.entity;
      const notes = paymentEntity?.notes || {};
      const userId = notes.user_id;
      const plan = notes.plan || "monthly";

      if (userId) {
        let proExpiresAt = null; // null means lifetime
        
        if (plan === "monthly") {
          proExpiresAt = new Date(Date.now() + 30 * 86400000).toISOString();
        } else if (plan === "annual") {
          proExpiresAt = new Date(Date.now() + 365 * 86400000).toISOString();
        }

        // Fetch the user to see if they were referred
        const { data: userProfile } = await supabase
          .from("users")
          .select("referred_by")
          .eq("id", userId)
          .single();

        const { error } = await supabase
          .from("users")
          .update({ is_pro: true, pro_expires_at: proExpiresAt })
          .eq("id", userId);

        if (error) {
          console.error("Failed to upgrade user:", error);
        } else {
          console.log(`[WEBHOOK] User ${userId} upgraded to Pro (${plan}). Expires: ${proExpiresAt || 'never'}`);
          
          // Reward the referrer
          if (userProfile && userProfile.referred_by) {
            const { data: referrer } = await supabase
              .from("users")
              .select("pro_expires_at")
              .eq("id", userProfile.referred_by)
              .single();
              
            if (referrer) {
              const currentExpiry = referrer.pro_expires_at ? new Date(referrer.pro_expires_at).getTime() : Date.now();
              // Add 30 days
              const newExpiry = new Date(currentExpiry + 30 * 86400000).toISOString();
              
              await supabase
                .from("users")
                .update({ is_pro: true, pro_expires_at: newExpiry })
                .eq("id", userProfile.referred_by);
                
              console.log(`[WEBHOOK] Referrer ${userProfile.referred_by} rewarded with 30 days of Pro.`);
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Razorpay Webhook Error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
