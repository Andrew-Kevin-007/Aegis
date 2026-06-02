"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cat, MessageSquare, Moon, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { DBUser } from "@/lib/database.types";

interface Position {
  x: number;
  y: number;
}

export default function GlobalKat() {
  const [position, setPosition] = useState<Position>({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
  const [message, setMessage] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "roaming" | "sleeping" | "alert">("idle");
  const [user, setUser] = useState<DBUser | null>(null);
  const [isClient, setIsClient] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    setPosition({ x: window.innerWidth - 150, y: window.innerHeight - 150 });
    
    async function init() {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data } = await supabase.from("users").select("*").eq("id", authUser.id).single();
        if (data) setUser(data);
      }
    }
    init();
  }, []);

  // Roaming Engine
  useEffect(() => {
    if (!isClient) return;

    const findTarget = () => {
      // Elements to interact with
      const targets = [
        document.getElementById("dashboard-active-tab"),
        document.getElementById("dashboard-total-debt"),
        document.querySelector("header"),
        document.querySelector("button")
      ];
      
      const validTargets = targets.filter(t => t !== null);
      if (validTargets.length > 0) {
        const target = validTargets[Math.floor(Math.random() * validTargets.length)];
        const rect = target!.getBoundingClientRect();
        
        // Jump to top of the element
        return {
          x: rect.left + (Math.random() * rect.width),
          y: rect.top - 60 // sit on top
        };
      }
      
      // Random roaming fallback
      return {
        x: Math.max(50, Math.random() * (window.innerWidth - 100)),
        y: Math.max(50, Math.random() * (window.innerHeight - 100))
      };
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        const newPos = findTarget();
        setPosition(newPos);
        setState(Math.random() > 0.7 ? "sleeping" : "roaming");
        
        // Sometimes talk
        if (Math.random() > 0.6 && user) {
          const tone = user.ai_tone || "hype";
          const name = user.companion_name || "Aegis";
          
          if (tone === "roast") {
            const roasts = [
              "Are you really buying more coffee?",
              "I see that Klarna bill. Pay it.",
              "I'm judging your spending habits.",
              "You know compound interest works both ways, right?"
            ];
            setMessage(`[${name}]: ${roasts[Math.floor(Math.random() * roasts.length)]}`);
          } else {
            const hypes = [
              "You're doing great!",
              "Keep up the debt-free streak!",
              "I believe in your financial freedom.",
              "Let's crush those liabilities!"
            ];
            setMessage(`[${name}]: ${hypes[Math.floor(Math.random() * hypes.length)]}`);
          }
          
          setTimeout(() => setMessage(null), 5000);
        }
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [isClient, user]);

  if (!isClient) return null;

  return (
    <motion.div
      ref={containerRef}
      className="fixed z-[9999] pointer-events-none"
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", damping: 15, stiffness: 50, mass: 1 }}
    >
      <div className="relative flex flex-col items-center pointer-events-auto cursor-pointer" onClick={() => {
        setMessage(user?.ai_tone === "roast" ? "Don't poke me." : "Purrrr...");
        setState("alert");
        setTimeout(() => setMessage(null), 3000);
      }}>
        
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute bottom-full mb-4 whitespace-nowrap bg-surface border border-border shadow-lg rounded-2xl px-4 py-2"
            >
              <p className="text-sm font-medium text-text-primary">{message}</p>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-surface border-b border-r border-border rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-12 h-12 bg-surface border border-border shadow-sm rounded-full flex items-center justify-center overflow-hidden hover:scale-110 transition-transform">
          {state === "sleeping" ? (
            <Moon className="w-6 h-6 text-text-muted" />
          ) : state === "alert" ? (
            <MessageSquare className="w-6 h-6 text-warning" />
          ) : (
            <Cat className="w-6 h-6 text-primary" />
          )}
        </div>
        
        {user?.companion_name && (
          <div className="absolute top-full mt-2 bg-primary/10 px-2 py-0.5 rounded-full backdrop-blur-sm">
            <p className="text-[10px] font-mono font-bold text-primary">{user.companion_name}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
