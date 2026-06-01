"use client";

import { motion, useMotionValue, animate } from "framer-motion";
import { useEffect } from "react";

interface HealthScoreProps {
  score: number;
}

function getScoreConfig(score: number) {
  if (score >= 90) return { label: "PROTECTED", color: "#00FF87", bg: "rgba(0,255,135,0.08)", border: "rgba(0,255,135,0.2)" };
  if (score >= 70) return { label: "STABLE", color: "#FFFFFF", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.1)" };
  if (score >= 40) return { label: "AT RISK", color: "#FF9F0A", bg: "rgba(255,159,10,0.08)", border: "rgba(255,159,10,0.2)" };
  return { label: "CRITICAL", color: "#FF3B30", bg: "rgba(255,59,48,0.08)", border: "rgba(255,59,48,0.2)" };
}

export default function HealthScore({ score }: HealthScoreProps) {
  const motionScore = useMotionValue(0);
  const config = getScoreConfig(score);

  useEffect(() => {
    const controls = animate(motionScore, score, { duration: 1.4, ease: "easeOut" });
    return controls.stop;
  }, [score, motionScore]);

  return (
    <div
      id="dashboard-health-score"
      className="rounded-xl p-5 border"
      style={{ backgroundColor: config.bg, borderColor: config.border }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-1">
            Aegis Health Score
          </p>
          <div className="flex items-baseline gap-2">
            <motion.span
              className="text-4xl font-bold font-numeric tracking-tighter"
              style={{ color: config.color }}
            >
              {Math.round(score)}
            </motion.span>
            <span className="text-text-muted text-sm font-mono">/100</span>
          </div>
        </div>
        <div
          className="px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-widest font-bold border"
          style={{ color: config.color, borderColor: config.border, backgroundColor: config.bg }}
        >
          {config.label}
        </div>
      </div>

      {/* Progress bar — dot-matrix style */}
      <div className="flex gap-0.5">
        {Array.from({ length: 20 }).map((_, i) => {
          const threshold = (i + 1) * 5;
          const filled = score >= threshold;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: i * 0.03, duration: 0.2 }}
              className="flex-1 h-2 rounded-sm"
              style={{
                backgroundColor: filled ? config.color : "rgba(255,255,255,0.06)",
              }}
            />
          );
        })}
      </div>

      <p className="font-mono text-[10px] text-text-muted mt-3 leading-relaxed">
        Score factors: active liability ratio · days to next due · streak count · scan frequency.
        Updates daily when you open the dashboard.
      </p>
    </div>
  );
}
