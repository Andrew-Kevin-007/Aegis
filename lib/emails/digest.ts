import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

export async function sendDigestEmail({ 
  to, 
  exposure, 
  prevented, 
  upcoming 
}: { 
  to: string, 
  exposure: number, 
  prevented: number, 
  upcoming: number 
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <body style="background-color: #000000; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px 20px; line-height: 1.6;">
        <div style="max-w: 480px; margin: 0 auto; background-color: #0A0A0A; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden;">
          <div style="padding: 32px;">
            <div style="font-family: monospace; font-size: 10px; letter-spacing: 0.1em; color: #a1a1aa; margin-bottom: 24px; text-transform: uppercase;">
              [ Weekly Exposure Digest ]
            </div>
            
            <h1 style="font-size: 32px; font-weight: 600; margin: 0 0 4px 0; letter-spacing: -0.02em;">
              £${exposure.toFixed(2)}
            </h1>
            <p style="color: #a1a1aa; font-size: 12px; margin: 0 0 32px 0; text-transform: uppercase; letter-spacing: 0.05em;">
              Current Total Exposure
            </p>
            
            <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 24px; margin-bottom: 24px; display: flex; justify-content: space-between;">
              <div>
                <p style="color: #a1a1aa; font-size: 12px; margin: 0 0 4px 0;">Upcoming this week</p>
                <p style="font-size: 18px; font-weight: 500; margin: 0;">${upcoming} payments</p>
              </div>
              <div style="text-align: right;">
                <p style="color: #a1a1aa; font-size: 12px; margin: 0 0 4px 0;">Fees Prevented</p>
                <p style="font-size: 18px; font-weight: 500; margin: 0; color: #22c55e;">£${prevented.toFixed(2)}</p>
              </div>
            </div>
            
            <a href="https://getaegis.app/dashboard" style="display: block; width: 100%; text-align: center; background-color: #ffffff; color: #000000; padding: 14px 0; border-radius: 8px; font-weight: 500; font-size: 14px; text-decoration: none; margin-bottom: 16px;">
              View Dashboard
            </a>
            
            <p style="color: #71717a; font-size: 12px; text-align: center; margin: 0;">
              Aegis. The BNPL Credit Score Shield.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  if (process.env.NODE_ENV !== "production" || !process.env.RESEND_API_KEY) {
    console.log("[EMAIL SIMULATION] Digest sent to", to);
    return;
  }

  try {
    await resend.emails.send({
      from: "Aegis Digest <digest@updates.getaegis.app>",
      to,
      subject: `Your week in Aegis: £${exposure.toFixed(2)} exposure`,
      html,
    });
  } catch (error) {
    console.error("Failed to send Digest email:", error);
  }
}
