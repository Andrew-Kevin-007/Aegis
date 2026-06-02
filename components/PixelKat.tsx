"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { detectRegion } from "@/lib/region";
import { Heart } from "lucide-react";
import type { DBPayment } from "@/lib/database.types";
import { PixelArt } from "./ui/PixelArt";
import { KAT_FRAMES, KatSkin } from "@/lib/kat-frames";

const C = {
  fur: "#A0A0A0",
  pink: "#D0D0D0",
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

interface PixelKatProps {
  streak: number;
  hasOverdue: boolean;
  tier: "free" | "pro" | "elite";
  activePayments?: DBPayment[];
  skin?: KatSkin;
}

export default function PixelKat({ streak, hasOverdue, tier, activePayments = [], skin = "orange" }: PixelKatProps) {
  const level = getLevel(streak);
  const levelData = LEVEL_FRAMES[level];
  const { code } = detectRegion();

  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 20, stiffness: 100, mass: 0.5 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(springY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-15, 15]);

  const [isHappy, setIsHappy] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);
  let heartCounter = useRef(0);

  const [tipIndex, setTipIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [charIdx, setCharIdx] = useState(0);

  const tips = useRef<string[]>([]);
  const [currentFrame, setCurrentFrame] = useState<"idle" | "sleep" | "play" | "idle1" | "idle2" | "sleep1" | "sleep2" | "sit">("idle1");
  const frameTick = useRef(0);

  // Animation Loop for Dashboard Kat
  useEffect(() => {
    const interval = setInterval(() => {
      frameTick.current += 1;
      if (hasOverdue) {
        // Stressed/Sleeping or jittering
        setCurrentFrame(frameTick.current % 2 === 0 ? "sleep1" : "sleep2");
      } else if (isHappy || level >= 4) {
        // Happy / Playful (Sit + Tail Wag)
        setCurrentFrame(frameTick.current % 2 === 0 ? "sit" : "sit");
      } else {
        // Idle Breathing
        setCurrentFrame(frameTick.current % 2 === 0 ? "idle1" : "idle2");
      }
    }, 400);
    return () => clearInterval(interval);
  }, [hasOverdue, isHappy, level]);

  useEffect(() => {
    const newTips = [];
    if (hasOverdue) {
      newTips.push(`MEOW! Overdue payments detected. Credit bureaus are watching.`);
      newTips.push(`Tap an overdue payment to see your options!`);
    } else {
      if (streak > 0) {
        newTips.push(`${streak} payments down. Stay on track.`);
      } else {
        newTips.push(`Awaiting your first settle. Start building credit.`);
      }

      if (activePayments.length > 0) {
        const sorted = [...activePayments].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
        const nextPayment = sorted[0];
        const daysLeft = Math.ceil((new Date(nextPayment.due_date).getTime() - Date.now()) / 86400000);
        newTips.push(`Next liability: ${nextPayment.provider_name || 'Payment'} in ${daysLeft} days.`);
        
        if (tier === "elite") {
          newTips.push(`Burn rate optimal. No immediate threats.`);
        }
      }
      newTips.push("Pet me! *purrrrr*");
    }
    tips.current = newTips;
  }, [hasOverdue, streak, activePayments, tier]);

  useEffect(() => {
    if (tips.current.length <= 1) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.current.length);
      setCharIdx(0);
      setTypedText("");
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const currentTip = tips.current[tipIndex] || ">_";
    if (charIdx < currentTip.length) {
      const timeout = setTimeout(() => {
        setTypedText(currentTip.slice(0, charIdx + 1));
        setCharIdx(c => c + 1);
      }, 30);
      return () => clearTimeout(timeout);
    }
  }, [charIdx, tipIndex]);

  useEffect(() => {
    if (tier === "free") return; 

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const x = (e.clientX - centerX) / window.innerWidth;
      const y = (e.clientY - centerY) / window.innerHeight;
      
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, tier]);

  const handlePet = () => {
    if (tier === "free") return;
    setIsHappy(true);
    
    const newHeart = { id: heartCounter.current++, x: Math.random() * 40 - 20 };
    setHearts(h => [...h, newHeart]);
    
    setTimeout(() => {
      setHearts(h => h.filter(heart => heart.id !== newHeart.id));
    }, 1000);

    setTimeout(() => setIsHappy(false), 800);
  };

  return (
    <div
      id="dashboard-kat-companion"
      className="rounded-[24px] border border-white/5 p-6 bg-surface-hover/50 backdrop-blur-xl flex items-center gap-6 relative shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)] overflow-hidden"
    >
      <AnimatePresence>
        {hearts.map(heart => (
          <motion.div
            key={heart.id}
            initial={{ opacity: 0, y: 10, x: heart.x, scale: 0.5 }}
            animate={{ opacity: 1, y: -40, x: heart.x + (Math.random() * 20 - 10), scale: 1 }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute left-10 pointer-events-none text-danger z-10"
          >
            <Heart className="w-4 h-4 fill-danger" />
          </motion.div>
        ))}
      </AnimatePresence>

      <motion.div 
        ref={containerRef}
        onClick={handlePet}
        className="w-16 h-16 shrink-0 bg-background rounded-lg border border-white/10 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.05)] relative z-0 cursor-pointer overflow-hidden"
        style={{ 
          rotateX: tier === "free" ? 0 : rotateX, 
          rotateY: tier === "free" ? 0 : rotateY,
          transformStyle: "preserve-3d"
        }}
        whileHover={tier !== "free" ? { scale: 1.05 } : {}}
        whileTap={tier !== "free" ? { scale: 0.95 } : {}}
      >
        <PixelArt data={KAT_FRAMES[currentFrame === "play" ? "sit" : currentFrame]} skin={skin} size={40} className="mt-2" />
        
        {/* Status LED */}
        <div className={`absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full ${hasOverdue ? "bg-danger animate-pulse" : "bg-success"}`} style={{ filter: "grayscale(0)" }} />
      </motion.div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border text-primary-inverse font-bold"
            style={{ backgroundColor: tier === "elite" ? C.gold : levelData.accent, borderColor: tier === "elite" ? C.gold : levelData.accent }}
          >
            {tier === "elite" ? "ELITE" : `LVL ${level}`}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
            {tier === "free" ? "Basic Tracking" : tier === "elite" ? "Executive Guard" : levelData.label}
          </span>
        </div>

        <div className="bg-surface border border-border rounded-lg px-3 py-2 mt-2 mb-3 relative min-h-[42px] flex items-center">
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-white/10" />
          <p
            className="font-mono text-[11px] leading-relaxed"
            style={{ color: hasOverdue ? C.danger : tier === "elite" ? C.gold : levelData.accent }}
          >
            &gt; {typedText}
            {charIdx < (tips.current[tipIndex]?.length || 0) && (
              <span className="inline-block w-1.5 h-3 bg-current animate-pulse ml-0.5 align-middle" />
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🔥</span>
            <span className="font-mono text-xs text-text-primary font-bold">{streak}</span>
            <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">streak</span>
          </div>
          {level < 5 && tier !== "free" && (
            <div className="flex-1">
              <div className="h-1 bg-surface-hover rounded-full overflow-hidden">
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
