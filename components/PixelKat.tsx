"use client";

import { useEffect, useRef, useState } from "react";

// 16×16 pixel art frames — each entry is [x, y, colorKey]
// Colors
const C = {
  fur: "#E8B88A",
  dark: "#1A0A00",
  pink: "#FF9CB4",
  eye: "#1A0A00",
  white: "#FFFFFF",
  green: "#00FF87",
  gold: "#FFD700",
  empty: "transparent",
};

type PixelFrame = Array<[number, number, string]>;

const IDLE_1: PixelFrame = [
  [5,0,C.dark],[6,0,C.dark],[7,0,C.dark],[8,0,C.dark],[9,0,C.dark],[10,0,C.dark],
  [4,1,C.dark],[5,1,C.fur],[6,1,C.fur],[7,1,C.fur],[8,1,C.fur],[9,1,C.fur],[10,1,C.fur],[11,1,C.dark],
  [3,2,C.dark],[4,2,C.fur],[5,2,C.fur],[6,2,C.fur],[7,2,C.fur],[8,2,C.fur],[9,2,C.fur],[10,2,C.fur],[11,2,C.fur],[12,2,C.dark],
  [3,3,C.dark],[4,3,C.fur],[5,3,C.eye],[6,3,C.fur],[7,3,C.fur],[8,3,C.fur],[9,3,C.eye],[10,3,C.fur],[11,3,C.fur],[12,3,C.dark],
  [3,4,C.dark],[4,4,C.fur],[5,4,C.fur],[6,4,C.fur],[7,4,C.pink],[8,4,C.fur],[9,4,C.fur],[10,4,C.fur],[11,4,C.fur],[12,4,C.dark],
  [3,5,C.dark],[4,5,C.fur],[5,5,C.fur],[6,5,C.fur],[7,5,C.fur],[8,5,C.fur],[9,5,C.fur],[10,5,C.fur],[11,5,C.fur],[12,5,C.dark],
  [4,6,C.dark],[5,6,C.fur],[6,6,C.fur],[7,6,C.fur],[8,6,C.fur],[9,6,C.fur],[10,6,C.fur],[11,6,C.dark],
  [4,7,C.dark],[5,7,C.fur],[6,7,C.fur],[7,7,C.fur],[8,7,C.fur],[9,7,C.fur],[10,7,C.fur],[11,7,C.dark],
  [4,8,C.dark],[5,8,C.fur],[6,8,C.fur],[7,8,C.fur],[8,8,C.fur],[9,8,C.fur],[10,8,C.fur],[11,8,C.dark],
  [3,9,C.dark],[4,9,C.fur],[5,9,C.fur],[10,9,C.fur],[11,9,C.fur],[12,9,C.dark],
  [3,10,C.dark],[4,10,C.fur],[5,10,C.fur],[10,10,C.fur],[11,10,C.fur],[12,10,C.dark],
  [3,11,C.dark],[4,11,C.fur],[5,11,C.dark],[10,11,C.dark],[11,11,C.fur],[12,11,C.dark],
  [14,8,C.fur],[15,8,C.dark],[14,9,C.dark],[13,10,C.dark],[14,10,C.fur],[15,10,C.dark],
];

const IDLE_2: PixelFrame = [
  ...IDLE_1.filter(p => !(p[0] === 14 && p[1] === 8)),
  [14,7,C.fur],[15,7,C.dark],[14,8,C.dark],
];

const STRESSED_1: PixelFrame = [
  [5,0,C.dark],[6,0,C.dark],[7,0,C.dark],[8,0,C.dark],[9,0,C.dark],[10,0,C.dark],
  [4,1,C.dark],[5,1,C.fur],[6,1,C.fur],[7,1,C.fur],[8,1,C.fur],[9,1,C.fur],[10,1,C.fur],[11,1,C.dark],
  [3,2,C.dark],[4,2,C.fur],[5,2,C.fur],[6,2,C.fur],[7,2,C.fur],[8,2,C.fur],[9,2,C.fur],[10,2,C.fur],[11,2,C.fur],[12,2,C.dark],
  [3,3,C.dark],[4,3,C.fur],[5,3,C.dark],[6,3,C.dark],[7,3,C.fur],[8,3,C.fur],[9,3,C.dark],[10,3,C.dark],[11,3,C.fur],[12,3,C.dark],
  [3,4,C.dark],[4,4,C.fur],[5,4,C.fur],[6,4,C.fur],[7,4,C.pink],[8,4,C.fur],[9,4,C.fur],[10,4,C.fur],[11,4,C.fur],[12,4,C.dark],
  [3,5,C.dark],[4,5,C.fur],[5,5,C.dark],[6,5,C.fur],[7,5,C.fur],[8,5,C.fur],[9,5,C.fur],[10,5,C.dark],[11,5,C.fur],[12,5,C.dark],
  [4,6,C.dark],[5,6,C.fur],[6,6,C.fur],[7,6,C.fur],[8,6,C.fur],[9,6,C.fur],[10,6,C.fur],[11,6,C.dark],
  [4,7,C.dark],[5,7,C.fur],[6,7,C.fur],[7,7,C.fur],[8,7,C.fur],[9,7,C.fur],[10,7,C.fur],[11,7,C.dark],
  [4,8,C.dark],[5,8,C.fur],[6,8,C.fur],[7,8,C.fur],[8,8,C.fur],[9,8,C.fur],[10,8,C.fur],[11,8,C.dark],
  [3,9,C.dark],[4,9,C.fur],[5,9,C.fur],[10,9,C.fur],[11,9,C.fur],[12,9,C.dark],
  [3,10,C.dark],[4,10,C.fur],[5,10,C.dark],[10,10,C.dark],[11,10,C.fur],[12,10,C.dark],
];

const HAPPY_1: PixelFrame = [
  ...IDLE_1,
  [7,11,C.gold],[8,11,C.gold],[9,11,C.gold],
  [6,12,C.gold],[7,12,C.gold],[8,12,C.gold],[9,12,C.gold],[10,12,C.gold],
];
const HAPPY_2: PixelFrame = [
  ...IDLE_2,
  [7,10,C.gold],[8,10,C.gold],[9,10,C.gold],
  [6,11,C.gold],[7,11,C.gold],[8,11,C.gold],[9,11,C.gold],[10,11,C.gold],
];

const LEVEL_FRAMES: Record<number, { frames: PixelFrame[]; label: string; accent: string }> = {
  1: { frames: [IDLE_1, IDLE_2], label: "Kitten", accent: C.fur },
  2: { frames: [IDLE_1, IDLE_2, IDLE_1, IDLE_2], label: "Cat", accent: C.pink },
  3: { frames: [IDLE_1, IDLE_2], label: "Warrior Kat", accent: C.green },
  4: { frames: [IDLE_1, IDLE_2], label: "Aegis Kat", accent: C.green },
  5: { frames: [HAPPY_1, HAPPY_2, IDLE_1, HAPPY_1], label: "Legend Kat", accent: C.gold },
};

function getLevel(streak: number) {
  if (streak >= 30) return 5;
  if (streak >= 15) return 4;
  if (streak >= 7) return 3;
  if (streak >= 3) return 2;
  return 1;
}

function getMood(hasOverdue: boolean, streak: number): { frames: PixelFrame[]; speech: string; fps: number } {
  if (hasOverdue) return {
    frames: [STRESSED_1, IDLE_1, STRESSED_1],
    speech: "MEOW! Overdue payments detected. My stress levels are critical.",
    fps: 5,
  };
  const lvl = getLevel(streak);
  if (lvl >= 4) return { frames: [HAPPY_1, HAPPY_2, HAPPY_1, IDLE_1], speech: `Legend status. ${streak} payments settled. Undefeated.`, fps: 10 };
  if (lvl === 3) return { frames: [IDLE_1, IDLE_2, HAPPY_1, IDLE_2], speech: `Warrior mode. ${streak} streak. Keep going.`, fps: 8 };
  return { frames: [IDLE_1, IDLE_2], speech: streak > 0 ? `${streak} payments down. Stay on track.` : "Awaiting your first settle.", fps: 8 };
}

interface PixelKatProps {
  streak: number;
  hasOverdue: boolean;
}

export default function PixelKat({ streak, hasOverdue }: PixelKatProps) {
  const [frameIdx, setFrameIdx] = useState(0);
  const level = getLevel(streak);
  const mood = getMood(hasOverdue, streak);
  const levelData = LEVEL_FRAMES[level];

  useEffect(() => {
    setFrameIdx(0);
    const interval = setInterval(() => {
      setFrameIdx(i => (i + 1) % mood.frames.length);
    }, 1000 / mood.fps);
    return () => clearInterval(interval);
  }, [hasOverdue, streak, mood.fps, mood.frames.length]);

  const frame = mood.frames[frameIdx];
  const PIXEL_SIZE = 7;
  const GRID = 16;

  // Build pixel map from frame data
  const grid: Record<string, string> = {};
  frame.forEach(([x, y, color]) => { grid[`${x},${y}`] = color; });

  const shakeStyle = hasOverdue ? {
    animation: "shake 0.3s ease-in-out infinite alternate",
  } : {};

  return (
    <div
      id="dashboard-kat-companion"
      className="rounded-xl border border-white/5 p-5 bg-[#050505] flex items-center gap-6"
    >
      <style>{`
        @keyframes shake {
          0% { transform: translateX(-2px); }
          100% { transform: translateX(2px); }
        }
        .pixel-kat { image-rendering: pixelated; }
      `}</style>

      {/* Pixel canvas */}
      <div
        className="pixel-kat flex-shrink-0 relative"
        style={{ width: GRID * PIXEL_SIZE, height: GRID * PIXEL_SIZE, ...shakeStyle }}
      >
        <div
          className="pixel-kat absolute inset-0"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${GRID}, ${PIXEL_SIZE}px)`,
            gridTemplateRows: `repeat(${GRID}, ${PIXEL_SIZE}px)`,
          }}
        >
          {Array.from({ length: GRID * GRID }).map((_, i) => {
            const x = i % GRID;
            const y = Math.floor(i / GRID);
            const color = grid[`${x},${y}`] || "transparent";
            return (
              <div
                key={i}
                style={{ backgroundColor: color, width: PIXEL_SIZE, height: PIXEL_SIZE }}
              />
            );
          })}
        </div>
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
        <div className="bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 mt-2 mb-3">
          <p
            className="font-mono text-xs leading-relaxed"
            style={{ color: hasOverdue ? "#FF3B30" : levelData.accent }}
          >
            &gt; {mood.speech}
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
