import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

export async function sendConvertEmail({ to }: { to: string }) {
  const html = `
    <!DOCTYPE html>
    <html>
      <body style="background-color: #000000; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px 20px; line-height: 1.6;">
        <div style="max-w: 480px; margin: 0 auto; background-color: #0A0A0A; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden;">
          <div style="padding: 32px;">
            <div style="font-family: monospace; font-size: 10px; letter-spacing: 0.1em; color: #ffffff; margin-bottom: 24px; text-transform: uppercase;">
              [ Aegis Pro Unlock ]
            </div>
            
            <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 16px 0; letter-spacing: -0.02em;">
              You've been with Aegis for a week.
            </h1>
            
            <p style="color: #a1a1aa; font-size: 14px; margin: 0 0 24px 0;">
              Over the last 7 days, you've taken control of your BNPL exposure. But manual tracking only goes so far.
            </p>
            
            <p style="color: #a1a1aa; font-size: 14px; margin: 0 0 32px 0;">
              For less than the cost of a single Klarna late fee, Aegis Pro will automatically text and email you 48 hours before any payment is due. Never think about a due date again.
            </p>
            
            <a href="https://getaegis.app/upgrade" style="display: block; width: 100%; text-align: center; background-color: #ffffff; color: #000000; padding: 14px 0; border-radius: 8px; font-weight: 500; font-size: 14px; text-decoration: none; margin-bottom: 16px;">
              Unlock Aegis Pro
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
    console.log("[EMAIL SIMULATION] Convert sent to", to);
    return;
  }

  try {
    await resend.emails.send({
      from: "Aegis Pro <pro@updates.getaegis.app>",
      to,
      subject: "Automate your credit protection.",
      html,
    });
  } catch (error) {
    console.error("Failed to send Convert email:", error);
  }
}
