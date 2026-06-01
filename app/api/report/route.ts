import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { payments } = await request.json();
    if (!payments || !Array.isArray(payments) || payments.length === 0) {
      return NextResponse.json({ error: "No payments provided" }, { status: 400 });
    }

    // Check if we already have a fresh report (cached per-scan)
    const { data: existing } = await supabase
      .from("users")
      .select("ai_report, ai_report_at")
      .eq("id", user.id)
      .single();

    // Return cached if < 24h old
    if (existing?.ai_report && existing?.ai_report_at) {
      const age = Date.now() - new Date(existing.ai_report_at).getTime();
      if (age < 24 * 60 * 60 * 1000) {
        return NextResponse.json({ report: existing.ai_report, cached: true });
      }
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `You are a UK credit specialist at Aegis, a financial protection startup.
A user has the following active BNPL payments:
${JSON.stringify(payments, null, 2)}

Write a concise plain-English BNPL Health Report in exactly 3 sections:

RISK SUMMARY: (1 sentence — overall risk level and why)

RECOMMENDED ACTION:
- (specific payment to prioritise and why)
- (second action if applicable)

CREDIT IMPACT: (1 sentence — what the FCA regulation change on 15 July 2026 means for their specific situation)

Rules: Direct, expert tone. No emojis. No jargon. Max 130 words total. Use GBP (£) for amounts.`;

    const result = await model.generateContent(prompt);
    const report = result.response.text().trim();

    // Cache the report in Supabase
    await supabase
      .from("users")
      .update({ ai_report: report, ai_report_at: new Date().toISOString() })
      .eq("id", user.id);

    return NextResponse.json({ report, cached: false });
  } catch (err: any) {
    console.error("AI Report error:", err);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
