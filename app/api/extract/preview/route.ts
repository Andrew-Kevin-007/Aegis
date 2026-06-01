import { NextResponse } from "next/server";
import { extractPaymentsFromImage } from "@/lib/gemini";

// In-memory rate limiting map for basic protection. 
// A real app would use Redis/Upstash for cross-server consistency.
const ipScanCounts = new Map<string, { count: number, timestamp: number }>();

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    
    const rateLimit = ipScanCounts.get(ip);
    if (rateLimit) {
      if (now - rateLimit.timestamp < 3600000) { // 1 hour window
        if (rateLimit.count >= 2) {
          return NextResponse.json({ 
            error: "Too many trial scans from this IP. Please create a free account." 
          }, { status: 429 });
        }
        rateLimit.count++;
      } else {
        ipScanCounts.set(ip, { count: 1, timestamp: now });
      }
    } else {
      ipScanCounts.set(ip, { count: 1, timestamp: now });
    }

    const body = await request.json();
    const { imageBase64, mimeType } = body;

    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    // Call Gemini AI
    const payments = await extractPaymentsFromImage(imageBase64, mimeType);

    return NextResponse.json({
      payments,
      extracted_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("API /extract/preview error:", error);
    return NextResponse.json(
      { error: "Could not read this screenshot. Try a clearer image." },
      { status: 500 }
    );
  }
}
