import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/server";

const PLANS = {
  monthly: { amount: 999, description: "Aegis Pro - Monthly" }, // £9.99
  "half-year": { amount: 4999, description: "Aegis Pro - Half-Year" }, // £49.99
  annual: { amount: 7999, description: "Aegis Pro - Annual" },   // £79.99
};

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const planKey = body.plan as keyof typeof PLANS;
    const plan = PLANS[planKey] || PLANS.monthly;

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
    });

    const options = {
      amount: plan.amount,
      currency: "GBP",
      receipt: `receipt_${user.id}_${Date.now()}`,
      notes: {
        user_id: user.id,
        user_email: user.email || "",
        plan: planKey || "monthly",
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
    });
  } catch (error: any) {
    console.error("Razorpay order generation error:", error);
    return NextResponse.json({ error: "Failed to generate payment order" }, { status: 500 });
  }
}
