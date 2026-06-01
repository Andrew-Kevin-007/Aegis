import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

export async function sendAlertEmail({
  to,
  provider,
  amount,
  dueDate,
  ficoImpact,
}: {
  to: string;
  provider: string;
  amount: number;
  dueDate: string;
  ficoImpact: number;
}) {
  const formattedDate = new Date(dueDate).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="background-color: #000000; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px 20px; line-height: 1.6;">
        <div style="max-w: 480px; margin: 0 auto; background-color: #0A0A0A; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden;">
          <div style="padding: 32px;">
            <div style="font-family: monospace; font-size: 10px; letter-spacing: 0.1em; color: #ef4444; margin-bottom: 24px; text-transform: uppercase;">
              [ Action Required: Credit Score Protection ]
            </div>
            
            <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 8px 0; letter-spacing: -0.02em;">
              Your ${provider} payment is due soon.
            </h1>
            
            <p style="color: #a1a1aa; font-size: 14px; margin: 0 0 32px 0;">
              A payment of <strong>£${amount.toFixed(2)}</strong> is scheduled for <strong>${formattedDate}</strong>.
            </p>
            
            <div style="background-color: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; padding: 16px; margin-bottom: 32px;">
              <p style="color: #ef4444; font-family: monospace; font-size: 11px; margin: 0;">
                ⚠️ FICO IMPACT WARNING: Missing this payment could lower your credit score by an estimated ${ficoImpact} points under new FICO 10 models.
              </p>
            </div>
            
            <a href="https://getaegis.app/dashboard" style="display: block; width: 100%; text-align: center; background-color: #ffffff; color: #000000; padding: 14px 0; border-radius: 8px; font-weight: 500; font-size: 14px; text-decoration: none; margin-bottom: 16px;">
              Settle Payment & Protect Score
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
    console.log("[EMAIL SIMULATION] Sent to", to);
    console.log(html);
    return;
  }

  try {
    await resend.emails.send({
      from: "Aegis Alerts <alerts@updates.getaegis.app>",
      to,
      subject: `Action Required: £${amount.toFixed(2)} ${provider} Payment Due`,
      html,
    });
  } catch (error) {
    console.error("Failed to send Resend email:", error);
  }
}
