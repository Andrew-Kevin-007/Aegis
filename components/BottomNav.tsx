"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Camera, Trophy, MessageSquare, User } from "lucide-react";
import { motion } from "framer-motion";

export default function BottomNav() {
  const pathname = usePathname();

  // Do not show on auth or onboarding/scan pages
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/onboarding" ||
    pathname === "/onboarding/process" ||
    pathname === "/auth/callback"
  ) {
    return null;
  }

  const navItems = [
    { name: "Home", href: "/dashboard", icon: Shield },
    { name: "Board", href: "/leaderboard", icon: Trophy },
    { name: "Scan", href: "/onboarding", icon: Camera, isCenter: true },
    { name: "Chat", href: "/community", icon: MessageSquare },
    { name: "You", href: "/profile", icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          if (item.isCenter) {
            return (
              <Link key={item.name} href={item.href} className="relative -top-5">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="w-14 h-14 bg-primary text-primary-inverse rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  <item.icon className="w-6 h-6" />
                </motion.div>
                <span className="sr-only">{item.name}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${
                isActive ? "text-success" : "text-text-muted hover:text-text-primary"
              }`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="font-mono text-[9px] uppercase tracking-widest">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
