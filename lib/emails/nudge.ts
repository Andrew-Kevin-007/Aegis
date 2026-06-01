import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

export async function sendNudgeEmail({ to, upcomingCount }: { to: string, upcomingCount: number }) {
  const html = `
    <!DOCTYPE html>
    <html>
      <body style="background-color: #000000; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px 20px; line-height: 1.6;">
        <div style="max-w: 480px; margin: 0 auto; background-color: #0A0A0A; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden;">
          <div style="padding: 32px;">
            <div style="font-family: monospace; font-size: 10px; letter-spacing: 0.1em; color: #f59e0b; margin-bottom: 24px; text-transform: uppercase;">
              [ Exposure Update ]
            </div>
            
            <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 16px 0; letter-spacing: -0.02em;">
              You have ${upcomingCount > 0 ? upcomingCount : 'untracked'} pending liabilities.
            </h1>
            
            <p style="color: #a1a1aa; font-size: 14px; margin: 0 0 24px 0;">
              You've been using Aegis for a few days. Remember that every active BNPL payment is now treated as active credit.
            </p>
            
            <div style="background-color: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 8px; padding: 16px; margin-bottom: 32px;">
              <p style="color: #f59e0b; font-family: monospace; font-size: 11px; margin: 0;">
                If a payment slips past 30 days late, it is reported to credit bureaus and remains on your file for up to 6 years.
              </p>
            </div>
            
            <a href="https://getaegis.app/onboarding" style="display: block; width: 100%; text-align: center; background-color: #ffffff; color: #000000; padding: 14px 0; border-radius: 8px; font-weight: 500; font-size: 14px; text-decoration: none; margin-bottom: 16px;">
              Update Your Exposure
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
    console.log("[EMAIL SIMULATION] Nudge sent to", to);
    return;
  }

  try {
    await resend.emails.send({
      from: "Aegis Status <status@updates.getaegis.app>",
      to,
      subject: "Are your BNPL apps up to date?",
      html,
    });
  } catch (error) {
    console.error("Failed to send Nudge email:", error);
  }
}
