"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Moon, Sun, Monitor, Flame, Heart } from "lucide-react";
import type { DBUser } from "@/lib/database.types";

export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();
  const [user, setUser] = useState<DBUser | null>(null);

  useEffect(() => {
    setMounted(true);
    async function fetchUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      const { data } = await supabase.from("users").select("*").eq("id", authUser.id).single();
      if (data) setUser(data);
    }
    fetchUser();
  }, [supabase]);

  const updateAITone = async (tone: "hype" | "roast") => {
    if (!user) return;
    setUser({ ...user, ai_tone: tone });
    const { error } = await supabase.from("users").update({ ai_tone: tone }).eq("id", user.id);
    if (error) {
      toast.error("Failed to update AI tone");
    } else {
      toast.success(`AI Tone set to ${tone === 'hype' ? 'Hype' : 'Roast'} Mode`);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary mb-2">Appearance & AI</h1>
        <p className="text-sm text-text-muted">Customize the look of Aegis and the personality of your AI.</p>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-xs font-mono uppercase tracking-widest text-text-muted mb-4">Theme</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setTheme("light")}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-colors ${
                theme === "light" ? "bg-primary text-primary-inverse border-primary" : "bg-surface border-border text-text-muted hover:border-text-muted"
              }`}
            >
              <Sun className="w-6 h-6" />
              <span className="text-sm font-medium">Adaptive Light</span>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-colors ${
                theme === "dark" ? "bg-primary text-primary-inverse border-primary" : "bg-surface border-border text-text-muted hover:border-text-muted"
              }`}
            >
              <Moon className="w-6 h-6" />
              <span className="text-sm font-medium">Cyberpunk Dark</span>
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-colors ${
                theme === "system" ? "bg-primary text-primary-inverse border-primary" : "bg-surface border-border text-text-muted hover:border-text-muted"
              }`}
            >
              <Monitor className="w-6 h-6" />
              <span className="text-sm font-medium">System Sync</span>
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-mono uppercase tracking-widest text-text-muted mb-4">Companion Personality (Tone)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              onClick={() => updateAITone("hype")}
              className={`p-5 rounded-xl border cursor-pointer transition-colors ${user?.ai_tone === "hype" ? "border-success bg-success/5" : "bg-surface border-border hover:border-text-muted"}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Heart className={`w-5 h-5 ${user?.ai_tone === "hype" ? "text-success" : "text-text-muted"}`} />
                <span className={`text-sm font-medium ${user?.ai_tone === "hype" ? "text-text-primary" : "text-text-muted"}`}>Hype Mode</span>
              </div>
              <p className="text-xs text-text-muted">Duolingo-style encouragement and gentle behavioral nudges to keep you on track.</p>
            </div>
            <div 
              onClick={() => updateAITone("roast")}
              className={`p-5 rounded-xl border cursor-pointer transition-colors ${user?.ai_tone === "roast" ? "border-danger bg-danger/5" : "bg-surface border-border hover:border-text-muted"}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Flame className={`w-5 h-5 ${user?.ai_tone === "roast" ? "text-danger" : "text-text-muted"}`} />
                <span className={`text-sm font-medium ${user?.ai_tone === "roast" ? "text-text-primary" : "text-text-muted"}`}>Roast Mode</span>
              </div>
              <p className="text-xs text-text-muted">Cleo-style brutally honest financial roasting. For when you need a wake-up call.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
