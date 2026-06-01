"use client";

import { useEffect, useState } from "react";
import { detectRegion } from "@/lib/region";

// Colors for accents
const C = {
  fur: "#E8B88A",
  pink: "#FF9CB4",
  green: "#00FF87",
  gold: "#FFD700",
  danger: "#FF3B30",
};

const LEVEL_FRAMES: Record<number, { label: string; accent: string }> = {
  1: { label: "Kitten", accent: C.fur },
  2: { label: "Cat", accent: C.pink },
  3: { label: "Warrior Kat", accent: C.green },
  4: { label: "Aegis Kat", accent: C.green },
  5: { label: "Legend Kat", accent: C.gold },
};

function getLevel(streak: number) {
  if (streak >= 30) return 5;
  if (streak >= 15) return 4;
  if (streak >= 7) return 3;
  if (streak >= 3) return 2;
  return 1;
}

function getSpeechContext(code: string) {
  switch (code) {
    case "IN": return "CIBIL doesn't forgive.";
    case "DE": return "SCHUFA is watching.";
    case "UK": return "The FCA is taking notes.";
    case "US": return "FICO remembers everything.";
    case "AU": return "Credit reporting is active.";
    default: return "Credit bureaus are watching.";
  }
}

interface PixelKatProps {
  streak: number;
  hasOverdue: boolean;
}

export default function PixelKat({ streak, hasOverdue }: PixelKatProps) {
  const level = getLevel(streak);
  const levelData = LEVEL_FRAMES[level];
  const { code } = detectRegion();
  const context = getSpeechContext(code);

  let moodClass = "sprite-idle";
  let speech = streak > 0 ? `${streak} payments down. Stay on track.` : "Awaiting your first settle.";
  
  if (hasOverdue) {
    moodClass = "sprite-stressed";
    speech = `MEOW! Overdue payments detected. ${context}`;
  } else if (level >= 4) {
    moodClass = "sprite-happy";
    speech = `Legend status. ${streak} payments settled. Undefeated.`;
  } else if (level === 3) {
    moodClass = "sprite-happy";
    speech = `Warrior mode. ${streak} streak. Keep going.`;
  }

  return (
    <div
      id="dashboard-kat-companion"
      className="rounded-xl border border-white/5 p-5 bg-[#050505] flex items-center gap-6"
    >
      <style>{`
        .pixel-kat-container {
          width: 64px;
          height: 64px;
          overflow: hidden;
          flex-shrink: 0;
          background-color: #000;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        
        .pixel-sprite {
          width: 256px; /* 4 frames * 64px */
          height: 256px; /* 4 rows * 64px */
          background-image: url('/kat-sprite.png');
          background-size: 256px 256px;
          image-rendering: pixelated;
        }

        .sprite-idle {
          animation: play-sprite 0.8s steps(4) infinite;
          background-position-y: 0px;
        }
        
        .sprite-happy {
          animation: play-sprite 0.6s steps(4) infinite;
          background-position-y: -64px;
        }
        
        .sprite-stressed {
          animation: play-sprite 0.4s steps(4) infinite;
          background-position-y: -128px;
        }
        
        .sprite-levelup {
          animation: play-sprite 0.7s steps(4) infinite;
          background-position-y: -192px;
        }

        @keyframes play-sprite {
          from { background-position-x: 0px; }
          to { background-position-x: -256px; }
        }
      `}</style>

      {/* Pixel sprite canvas */}
      <div className="pixel-kat-container shadow-[0_0_15px_rgba(0,255,135,0.1)]">
        <div className={`pixel-sprite ${moodClass}`} />
      </div>

      {/* Info panel */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border text-black font-bold"
            style={{ backgroundColor: levelData.accent, borderColor: levelData.accent }}
          >
            LVL {level}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
            {levelData.label}
          </span>
        </div>

        {/* Speech bubble */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 mt-2 mb-3 relative">
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-white/10" />
          <p
            className="font-mono text-xs leading-relaxed"
            style={{ color: hasOverdue ? C.danger : levelData.accent }}
          >
            &gt; {speech}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🔥</span>
            <span className="font-mono text-xs text-white font-bold">{streak}</span>
            <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">streak</span>
          </div>
          {level < 5 && (
            <div className="flex-1">
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, (streak / [3, 7, 15, 30][level - 1]) * 100)}%`,
                    backgroundColor: levelData.accent,
                  }}
                />
              </div>
              <p className="font-mono text-[9px] text-text-muted mt-1">
                {[3, 7, 15, 30][level - 1] - streak} more to level up
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
