import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { detectRegion, getRegionRegulation } from "@/lib/region";

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
      .select("ai_report, ai_report_at, ai_tone, companion_name")
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

    const { code, currency } = detectRegion();
    const regulationContext = getRegionRegulation(code);

    const tone = existing?.ai_tone || "hype";
    const name = existing?.companion_name || "Aegis AI";

    const roastPrompt = `You are ${name}, a snarky, brutally honest financial AI. 
The user has these active BNPL payments:
${JSON.stringify(payments, null, 2)}

Write a concise BNPL Health Report roasting their spending habits.
Format in 3 sections:
ROAST SUMMARY: (1 sarcastic sentence)
INTERVENTION PLAN:
- (specific payment to prioritise)
CREDIT THREAT: (1 sentence — what the upcoming ${regulationContext} means for them, make it sound serious)
Rules: Be funny but blunt. No emojis. Max 130 words. Use ${currency}.`;

    const hypePrompt = `You are ${name}, a highly encouraging, supportive financial AI (like Duolingo). 
The user has these active BNPL payments:
${JSON.stringify(payments, null, 2)}

Write a concise, positive BNPL Health Report motivating them.
Format in 3 sections:
HYPE SUMMARY: (1 encouraging sentence)
ACTION PLAN:
- (specific payment to prioritise)
CREDIT BOOST: (1 sentence — what the upcoming ${regulationContext} means for them positively if they pay on time)
Rules: Be extremely supportive. No emojis. Max 130 words. Use ${currency}.`;

    const prompt = tone === "roast" ? roastPrompt : hypePrompt;

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
