import React from 'react';
import { KAT_PALETTES, KatSkin } from '@/lib/kat-frames';

interface PixelArtProps {
  data: string[];
  size?: number;
  className?: string;
  skin?: KatSkin;
}

export function PixelArt({ data, size = 64, className = "", skin = "orange" }: PixelArtProps) {
  if (!data || !Array.isArray(data)) return null;

  const height = data.length;
  const width = Math.max(...data.map(row => row.length));
  
  const palette = KAT_PALETTES[skin] || KAT_PALETTES.orange;

  // We map the array into SVG rects.
  // This is highly optimized and perfectly crisp at any resolution.
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox={`0 0 ${width} ${height}`} 
      className={className}
      style={{ shapeRendering: 'crispEdges' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {data.map((row, y) => 
        row.split('').map((char, x) => {
          if (char === '.') return null;
          const color = palette[char as keyof typeof palette] || char; // fallback to literal if missing
          if (!color) return null;

          return (
            <rect 
              key={`${x}-${y}`} 
              x={x} 
              y={y} 
              width="1" 
              height="1" 
              fill={color} 
            />
          );
        })
      )}
    </svg>
  );
}
