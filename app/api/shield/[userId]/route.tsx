import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: user } = await supabase
    .from("users")
    .select("total_fees_prevented, streak_count, longest_streak")
    .eq("id", userId)
    .single();

  const fees = user?.total_fees_prevented ?? 0;
  const streak = user?.streak_count ?? 0;
  const handle = `Aegis_${userId.substring(0, 4).toUpperCase()}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#000000",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          fontFamily: "monospace",
          position: "relative",
        }}
      >
        {/* Grid noise overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle at 80% 20%, rgba(0,255,135,0.06) 0%, transparent 60%)",
        }} />

        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ color: "#555555", fontSize: "14px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "12px" }}>
              AEGIS · DEBT SHIELD CARD
            </div>
            <div style={{ color: "#FFFFFF", fontSize: "48px", fontWeight: "700", letterSpacing: "-0.02em" }}>
              {handle}
            </div>
          </div>
          <div style={{
            background: "rgba(0,255,135,0.1)",
            border: "1px solid rgba(0,255,135,0.3)",
            borderRadius: "12px",
            padding: "16px 24px",
            textAlign: "right",
          }}>
            <div style={{ color: "#555555", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "8px" }}>STREAK</div>
            <div style={{ color: "#00FF87", fontSize: "40px", fontWeight: "700" }}>🔥 {streak}</div>
          </div>
        </div>

        {/* Centre — main stat */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <div style={{ color: "#555555", fontSize: "13px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px" }}>
            TOTAL LATE FEES PREVENTED
          </div>
          <div style={{
            color: "#00FF87",
            fontSize: "96px",
            fontWeight: "800",
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}>
            £{fees.toFixed(2)}
          </div>
          <div style={{ color: "#333333", fontSize: "16px", marginTop: "12px" }}>
            Shielded by Aegis · getaegis.app
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid #1A1A1A",
          paddingTop: "32px",
        }}>
          <div style={{ color: "#333333", fontSize: "13px", letterSpacing: "0.1em" }}>
            FCA BNPL REGULATION · EFFECTIVE 15 JULY 2026
          </div>
          <div style={{ color: "#555555", fontSize: "13px" }}>
            getaegis.app
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
