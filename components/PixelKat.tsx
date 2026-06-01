"use client";

import { motion } from "framer-motion";

interface PixelKatProps {
  streak: number;
  hasOverdue: boolean;
}

export default function PixelKat({ streak, hasOverdue }: PixelKatProps) {
  // Determine Kat's mood and level
  let emoji = "😸";
  let message = "Purrfect. No overdue payments.";
  let bgClass = "bg-success/10 border-success/20";
  let textClass = "text-success";

  if (hasOverdue) {
    emoji = "😾";
    message = "Meow! You have overdue payments! My stress levels are high.";
    bgClass = "bg-danger/10 border-danger/20";
    textClass = "text-danger";
  } else if (streak > 10) {
    emoji = "🦁"; // Level up
    message = "ROAR! You are a debt-crushing beast! Level 2 Unlocked.";
    bgClass = "bg-warning/10 border-warning/20";
    textClass = "text-warning";
  } else if (streak > 5) {
    emoji = "😼";
    message = "You're on a roll. Keep the streak alive.";
  }

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`rounded-xl border p-4 flex items-center gap-4 ${bgClass}`}
    >
      <motion.div 
        animate={{ 
          y: hasOverdue ? [0, -5, 0] : [0, -10, 0],
          rotate: hasOverdue ? [-5, 5, -5] : 0
        }}
        transition={{ repeat: Infinity, duration: hasOverdue ? 0.3 : 2 }}
        className="text-4xl filter drop-shadow-lg"
      >
        {emoji}
      </motion.div>
      <div>
        <div className={`font-mono text-[10px] uppercase tracking-widest ${textClass} mb-1`}>
          Aegis Companion
        </div>
        <p className="text-sm font-medium text-white">{message}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-text-secondary">Current Streak:</span>
          <span className="text-xs font-bold bg-white/10 px-2 py-0.5 rounded text-white">🔥 {streak}</span>
        </div>
      </div>
    </motion.div>
  );
}
