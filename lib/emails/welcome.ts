import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

export async function sendWelcomeEmail({ to }: { to: string }) {
  const html = `
    <!DOCTYPE html>
    <html>
      <body style="background-color: #000000; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px 20px; line-height: 1.6;">
        <div style="max-w: 480px; margin: 0 auto; background-color: #0A0A0A; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden;">
          <div style="padding: 32px;">
            <div style="font-family: monospace; font-size: 10px; letter-spacing: 0.1em; color: #22c55e; margin-bottom: 24px; text-transform: uppercase;">
              [ Aegis Activated ]
            </div>
            
            <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 16px 0; letter-spacing: -0.02em;">
              Your credit file is now monitored.
            </h1>
            
            <p style="color: #a1a1aa; font-size: 14px; margin: 0 0 24px 0;">
              Welcome to Aegis. Every Klarna, Afterpay, and Clearpay purchase you make is a credit risk under the new FICO 10 reporting standards.
            </p>
            
            <p style="color: #a1a1aa; font-size: 14px; margin: 0 0 32px 0;">
              We built Aegis to ensure a forgotten £30 purchase doesn't cost you 40 points on your credit score. 
            </p>
            
            <a href="https://getaegis.app/onboarding" style="display: block; width: 100%; text-align: center; background-color: #ffffff; color: #000000; padding: 14px 0; border-radius: 8px; font-weight: 500; font-size: 14px; text-decoration: none; margin-bottom: 16px;">
              Scan Your First App
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
    console.log("[EMAIL SIMULATION] Welcome sent to", to);
    return;
  }

  try {
    await resend.emails.send({
      from: "Aegis <hello@updates.getaegis.app>",
      to,
      subject: "Welcome to Aegis. Your credit file is now monitored.",
      html,
    });
  } catch (error) {
    console.error("Failed to send Welcome email:", error);
  }
}
