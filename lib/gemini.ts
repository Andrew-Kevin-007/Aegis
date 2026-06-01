import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const PaymentSchema = z.object({
  provider: z.string(),
  item_name: z.string(),
  amount_due: z.number(),
  currency: z.string(),
  due_date: z.string(), // ISO 8601
  late_fee: z.number().nullable(),
  status: z.enum(["upcoming", "overdue", "paid"]),
});

export type Payment = z.infer<typeof PaymentSchema>;

export const ExtractionResponseSchema = z.array(PaymentSchema);

export async function extractPaymentsFromImage(base64Image: string, mimeType: string): Promise<Payment[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const prompt = `
Analyze this BNPL app screenshot. Extract ALL payment entries. For each return JSON:
{
  provider: string (Klarna/Afterpay/etc),
  item_name: string,
  amount_due: number (in original currency),
  currency: string (USD/GBP/EUR/etc),
  due_date: string (ISO 8601),
  late_fee: number (extract if visible, else null),
  status: 'upcoming' | 'overdue' | 'paid'
}
Return ONLY a JSON array. No explanation, no markdown blocks. Just the raw JSON array.
  `;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType,
        },
      },
    ]);

    const responseText = result.response.text();
    let jsonString = responseText.trim();
    
    // Clean up markdown code block artifacts if Gemini includes them despite the prompt
    if (jsonString.startsWith("\`\`\`json")) {
      jsonString = jsonString.replace(/^\`\`\`json\n?/, "").replace(/\n?\`\`\`$/, "");
    } else if (jsonString.startsWith("\`\`\`")) {
      jsonString = jsonString.replace(/^\`\`\`\n?/, "").replace(/\n?\`\`\`$/, "");
    }

    const parsedJson = JSON.parse(jsonString);
    const validatedData = ExtractionResponseSchema.parse(parsedJson);

    return validatedData;
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw new Error("Failed to extract payment data from image.");
  }
}
