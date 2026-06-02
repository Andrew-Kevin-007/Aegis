"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { DBUser } from "@/lib/database.types";
import { PixelArt } from "./ui/PixelArt";
import { KAT_FRAMES, KatSkin, KatFrame } from "@/lib/kat-frames";

type KatState = "idle" | "walk" | "sleep" | "jump" | "climb" | "sit" | "dragged";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  isButton: boolean;
}

export default function GlobalKat() {
  const [message, setMessage] = useState<string | null>(null);
  const [user, setUser] = useState<DBUser | null>(null);
  const [isClient, setIsClient] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // High-performance motion values
  const mvX = useMotionValue(-100);
  const mvY = useMotionValue(-100);
  
  // Physics State
  const pos = useRef({ x: 0, y: 0 });
  const vel = useRef({ vx: 0, vy: 0 });
  const state = useRef<KatState>("idle");
  const facingRight = useRef(true);
  
  // Target for roaming
  const targetX = useRef<number | null>(null);
  const targetButton = useRef<Rect | null>(null);

  // Animation Frame State (React state for visual updates)
  const [currentFrame, setCurrentFrame] = useState<KatFrame>("idle1");
  const [uiFacingRight, setUiFacingRight] = useState(true);
  const frameTick = useRef(0);

  useEffect(() => {
    setIsClient(true);
    // Initial drop-in
    pos.current = { x: window.innerWidth / 2, y: 50 };
    mvX.set(pos.current.x);
    mvY.set(pos.current.y);

    async function init() {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data } = await supabase.from("users").select("*").eq("id", authUser.id).single();
        if (data) setUser(data);
      }
    }
    init();
  }, [mvX, mvY]);

  // Frame-by-Frame Animation Loop
  useEffect(() => {
    if (!isClient) return;
    const interval = setInterval(() => {
      frameTick.current += 1;
      
      switch(state.current) {
        case "walk":
          setCurrentFrame(frameTick.current % 2 === 0 ? "walk1" : "walk2");
          break;
        case "climb":
          setCurrentFrame(frameTick.current % 2 === 0 ? "climb1" : "climb2");
          break;
        case "jump":
          setCurrentFrame("jump");
          break;
        case "sleep":
          setCurrentFrame(frameTick.current % 2 === 0 ? "sleep1" : "sleep2");
          break;
        case "sit":
          setCurrentFrame("sit");
          break;
        case "dragged":
          setCurrentFrame("jump");
          break;
        default:
          setCurrentFrame(frameTick.current % 2 === 0 ? "idle1" : "idle2");
          break;
      }
    }, 250); // Slightly slower for cute breathing
    return () => clearInterval(interval);
  }, [isClient]);

  // Main 2D Physics Loop
  useEffect(() => {
    if (!isClient) return;

    let animationFrameId: number;
    const K = 48; // Reduced Size
    const GRAVITY = 0.8;
    const MAX_FALL_SPEED = 15;
    const WALK_SPEED = 2;
    const CLIMB_SPEED = -3;

    const getColliders = (): Rect[] => {
      const colliders: Rect[] = [];
      // Ground floor
      colliders.push({ x: 0, w: window.innerWidth, y: window.innerHeight - 5, h: 100, isButton: false });
      
      // Elements
      document.querySelectorAll('.card, header, button').forEach(el => {
        const rect = el.getBoundingClientRect();
        // Ignore invisible or tiny elements
        if (rect.width > 20 && rect.height > 20) {
          colliders.push({ 
            x: rect.left, 
            y: rect.top, 
            w: rect.width, 
            h: rect.height,
            isButton: el.tagName.toLowerCase() === 'button' || el.textContent?.toLowerCase().includes('settle') || false
          });
        }
      });
      return colliders;
    };

    const updatePhysics = () => {
      if (state.current === "dragged") {
        animationFrameId = requestAnimationFrame(updatePhysics);
        return;
      }

      const colliders = getColliders();

      // State: CLIMBING
      if (state.current === "climb") {
        vel.current.vy = CLIMB_SPEED;
        vel.current.vx = 0;
        pos.current.y += vel.current.vy;

        // Check if we reached the top of whatever we are climbing
        let stillClimbing = false;
        for (const col of colliders) {
          // If we are touching the side
          const isTouchingLeftWall = pos.current.x + K >= col.x && pos.current.x + K < col.x + 20;
          const isTouchingRightWall = pos.current.x <= col.x + col.w && pos.current.x > col.x + col.w - 20;
          
          if ((isTouchingLeftWall || isTouchingRightWall) && pos.current.y + K > col.y) {
            stillClimbing = true;
            // Did we crest the top?
            if (pos.current.y + K/2 < col.y) {
              // Pull up!
              pos.current.y = col.y - K;
              pos.current.x += facingRight.current ? 20 : -20; // hop onto it
              vel.current.vy = 0;
              state.current = targetButton.current ? "sleep" : "walk";
              stillClimbing = false;
              break;
            }
          }
        }

        if (!stillClimbing && state.current === "climb") {
          // Fell off or reached top
          state.current = "jump";
        }
      } 
      // State: NORMAL (Walk, Jump, Idle)
      else {
        // Apply Gravity
        vel.current.vy += GRAVITY;
        if (vel.current.vy > MAX_FALL_SPEED) vel.current.vy = MAX_FALL_SPEED;

        // Apply Walking Velocity
        if (state.current === "walk" && targetX.current !== null) {
          const dx = targetX.current - pos.current.x;
          if (Math.abs(dx) < 5) {
            vel.current.vx = 0;
            state.current = "idle";
            targetX.current = null;
          } else {
            vel.current.vx = dx > 0 ? WALK_SPEED : -WALK_SPEED;
            const newFacingRight = dx > 0;
            if (facingRight.current !== newFacingRight) {
              facingRight.current = newFacingRight;
              setUiFacingRight(newFacingRight);
            }
          }
        } else if (state.current !== "walk" && state.current !== "jump") {
          vel.current.vx *= 0.8; // friction
        }

        // Pre-calculate next X
        const nextX = pos.current.x + vel.current.vx;
        let hitWall = false;

        // Check Wall Collisions (X-axis)
        for (const col of colliders) {
          // Are we vertically overlapping this collider?
          if (pos.current.y + K > col.y + 10 && pos.current.y < col.y + col.h - 10) {
            // Moving Right, hitting Left wall of collider
            if (vel.current.vx > 0 && pos.current.x + K <= col.x && nextX + K >= col.x) {
              pos.current.x = col.x - K;
              vel.current.vx = 0;
              hitWall = true;
              break;
            }
            // Moving Left, hitting Right wall of collider
            if (vel.current.vx < 0 && pos.current.x >= col.x + col.w && nextX <= col.x + col.w) {
              pos.current.x = col.x + col.w;
              vel.current.vx = 0;
              hitWall = true;
              break;
            }
          }
        }

        if (hitWall) {
          // Transition to Climb
          state.current = "climb";
        } else {
          pos.current.x = nextX;
        }

        // Apply Y
        pos.current.y += vel.current.vy;

        // Floor Collision Y
        let onGround = false;

        if (vel.current.vy > 0 && state.current !== "climb") { // falling
          for (const col of colliders) {
            // Horizontally within the collider?
            if (pos.current.x + K - 15 > col.x && pos.current.x + 15 < col.x + col.w) {
              // Crossed the top?
              if (pos.current.y + K >= col.y && pos.current.y + K - vel.current.vy <= col.y + 15) {
                pos.current.y = col.y - K;
                vel.current.vy = 0;
                onGround = true;
                
                if (state.current === "jump") {
                  state.current = "idle";
                }
                
                // If this is our target button, sit!
                if (targetButton.current && col.isButton) {
                  state.current = "sleep";
                  targetButton.current = null;
                }
                
                break;
              }
            }
          }
        } else if (vel.current.vy === 0 && state.current !== "climb") {
          // Check if walking off ledge
          for (const col of colliders) {
            if (pos.current.y + K === col.y && pos.current.x + K - 15 > col.x && pos.current.x + 15 < col.x + col.w) {
              onGround = true;
              break;
            }
          }
        }

        // Check if walking off ledge
        if (!onGround && state.current !== "jump" && state.current !== "climb") {
          state.current = "jump"; // falling
        }
      }

      // Absolute Bounds (safety)
      if (pos.current.x < 0) {
        pos.current.x = 0;
        if (state.current === "walk") state.current = "idle";
      } else if (pos.current.x > window.innerWidth - K) {
        pos.current.x = window.innerWidth - K;
        if (state.current === "walk") state.current = "idle";
      }

      if (pos.current.y > window.innerHeight - K) {
        pos.current.y = window.innerHeight - K;
        vel.current.vy = 0;
        if (state.current === "jump") state.current = "idle";
      }

      mvX.set(pos.current.x);
      mvY.set(pos.current.y);

      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    animationFrameId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isClient, mvX, mvY]);

  // AI Brain Loop
  useEffect(() => {
    if (!isClient) return;

    const actionLoop = setInterval(() => {
      if (state.current === "dragged" || state.current === "climb") return;

      const rand = Math.random();
      
      if (rand > 0.6) {
        const actionRand = Math.random();
        
        // 20% chance to target a Settle button to sleep on
        if (actionRand < 0.2) {
          const buttons = Array.from(document.querySelectorAll('button')).filter(b => b.textContent?.toLowerCase().includes('settle'));
          if (buttons.length > 0) {
            const btn = buttons[0];
            const rect = btn.getBoundingClientRect();
            targetButton.current = { x: rect.left, y: rect.top, w: rect.width, h: rect.height, isButton: true };
            targetX.current = rect.left + rect.width / 2 - 32;
            state.current = "walk";
            return;
          }
        }

        if (actionRand < 0.4) {
          // Walk
          targetX.current = Math.max(0, Math.min(window.innerWidth - 64, pos.current.x + (Math.random() - 0.5) * 600));
          state.current = "walk";
        } else if (actionRand < 0.6) {
          // Jump randomly
          if (state.current !== "jump") {
            vel.current.vy = -18;
            vel.current.vx = (Math.random() - 0.5) * 8;
            state.current = "jump";
          }
        } else if (actionRand < 0.8) {
          state.current = "sit";
          targetX.current = null;
        } else {
          state.current = "idle";
          targetX.current = null;
        }
        
        // Speak
        if (Math.random() > 0.8 && user) {
          const tone = user.ai_tone || "hype";
          const name = user.companion_name || "Aegis";
          
          if (tone === "roast") {
            const roasts = ["Judging you...", "Another coffee?", "Pay it off.", "Hmm."];
            setMessage(`[${name}]: ${roasts[Math.floor(Math.random() * roasts.length)]}`);
          } else {
            const hypes = ["You got this!", "Purrrrr...", "Nice streak!", "Let's go!"];
            setMessage(`[${name}]: ${hypes[Math.floor(Math.random() * hypes.length)]}`);
          }
          setTimeout(() => setMessage(null), 4000);
        }
      }
    }, 3000);

    return () => clearInterval(actionLoop);
  }, [isClient, user]);

  if (!isClient) return null;

  return (
    <motion.div
      ref={containerRef}
      className="fixed z-[9999] pointer-events-auto cursor-grab active:cursor-grabbing"
      style={{ x: mvX, y: mvY }}
      drag
      dragConstraints={{ left: 0, right: window.innerWidth - 48, top: 0, bottom: window.innerHeight - 48 }}
      dragElastic={0.1}
      dragMomentum={false}
      onDragStart={() => {
        state.current = "dragged";
        targetX.current = null;
        vel.current = { vx: 0, vy: 0 };
      }}
      onDragEnd={(_, info) => {
        pos.current.x = Math.min(window.innerWidth - 48, Math.max(0, pos.current.x + info.offset.x));
        pos.current.y = Math.min(window.innerHeight - 48, Math.max(0, pos.current.y + info.offset.y));
        mvX.set(pos.current.x);
        mvY.set(pos.current.y);
        state.current = "jump"; 
      }}
      onClick={() => {
        if (state.current !== "dragged" && state.current !== "climb") {
          state.current = "idle";
          vel.current.vy = -10; // little hop
          setMessage("Purrrrrr! <3");
          setTimeout(() => setMessage(null), 2000);
        }
      }}
    >
      <div className="relative flex flex-col items-center w-12 h-12">
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute bottom-[60px] whitespace-nowrap bg-background border-[2px] border-border shadow-[4px_4px_0_0_rgba(0,0,0,0.1)] rounded-sm px-3 py-1.5"
              style={{ fontFamily: "'Courier New', Courier, monospace" }}
            >
              <p className="text-xs font-bold text-text-primary">{message}</p>
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-background border-b-[2px] border-r-[2px] border-border rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          animate={{ scaleX: uiFacingRight ? 1 : -1 }}
          transition={{ duration: 0.2 }}
          className="relative drop-shadow-[0_10px_10px_rgba(0,0,0,0.15)]"
        >
          <PixelArt data={KAT_FRAMES[currentFrame]} skin={(user?.companion_skin as KatSkin) || "orange"} size={48} />
        </motion.div>
        
        {user?.companion_name && (
          <div className="absolute top-[48px] mt-1 bg-surface border border-border px-1.5 py-0.5 rounded-[4px] pointer-events-none">
            <p className="text-[9px] font-mono font-bold text-text-muted">{user.companion_name}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
