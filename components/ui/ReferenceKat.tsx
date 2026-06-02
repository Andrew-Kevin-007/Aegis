import React from 'react';

export type KatSkin = "white" | "grey" | "black" | "calico" | "orange";

// Mapping the 5x3 grid from the screenshot
const SKIN_POSITIONS: Record<KatSkin, { x: number, y: number }> = {
  white:  { x: 0, y: 0 },
  calico: { x: 25, y: 0 },
  grey:   { x: 50, y: 0 },
  black:  { x: 100, y: 0 },
  orange: { x: 50, y: 50 }, // Assuming middle of 2nd row
};

interface ReferenceKatProps {
  skin?: KatSkin;
  size?: number;
  className?: string;
  state?: "idle" | "walk" | "sleep" | "jump" | "play";
}

export function ReferenceKat({ skin = "orange", size = 64, className = "", state = "idle" }: ReferenceKatProps) {
  const pos = SKIN_POSITIONS[skin] || SKIN_POSITIONS.orange;
  
  // Squash and stretch animations based on state
  let animationClass = "";
  if (state === "walk") animationClass = "animate-kat-hop";
  if (state === "sleep") animationClass = "animate-kat-sleep";
  if (state === "jump") animationClass = "animate-kat-jump";
  if (state === "play") animationClass = "animate-kat-play";

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <div 
        className={`w-full h-full origin-bottom ${animationClass}`}
        style={{
          backgroundImage: `url('/Screenshot%202026-06-02%20195411.png')`,
          backgroundSize: '500% 300%', // 5 columns, 3 rows
          backgroundPosition: `${pos.x}% ${pos.y}%`,
          imageRendering: 'pixelated',
          backgroundRepeat: 'no-repeat'
        }}
      />
      {state === "sleep" && (
        <div className="absolute -top-4 right-0 font-mono text-xs text-text-muted animate-pulse">
          Zzz
        </div>
      )}
    </div>
  );
}
