"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import { ChevronLeft, Trophy, Crown, ArrowUp, Star } from "lucide-react";
import { toast, Toaster } from "sonner";
import { formatCurrency } from "@/lib/currency";
import { detectRegion } from "@/lib/region";

interface LeaderboardUser {
  id: string;
  total_fees_prevented: number;
  streak_count: number;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const { code, currency } = detectRegion();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      // Fetch leaderboard
      const { data: leaderData } = await supabase
        .from("users")
        .select("id, total_fees_prevented, streak_count")
        .order("total_fees_prevented", { ascending: false })
        .limit(50);
      
      if (leaderData) setLeaders(leaderData);
      setLoading(false);
    }
    load();
  }, [supabase]);

  return (
    <main className="min-h-screen bg-background text-text-primary px-6 py-12 pb-24 relative overflow-hidden">
      <Toaster theme="dark" closeButton />
      
      <button 
        onClick={() => router.push("/dashboard")} 
        className="absolute top-8 left-8 text-text-secondary hover:text-white hidden md:flex items-center gap-2 font-mono text-xs uppercase z-10"
      >
        <ChevronLeft className="w-4 h-4" /> Dashboard
      </button>

      <div className="max-w-2xl mx-auto z-10 relative">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Global Leaderboard</h1>
          <p className="text-text-secondary text-sm font-mono tracking-wide">
            Top {code} users protecting their credit score.
          </p>
        </div>

        <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10 mb-8 max-w-sm mx-auto">
          <button className="flex-1 py-1.5 text-xs font-mono uppercase bg-white text-black rounded-lg shadow-sm">All Time</button>
          <button className="flex-1 py-1.5 text-xs font-mono uppercase text-text-muted hover:text-white transition-colors">This Week</button>
          <button className="flex-1 py-1.5 text-xs font-mono uppercase text-text-muted hover:text-white transition-colors">This Month</button>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse h-16 bg-white/5 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {leaders.length === 0 ? (
              <div className="text-center py-10 text-text-muted text-sm border border-white/5 border-dashed rounded-xl">
                No leaders yet. Be the first.
              </div>
            ) : leaders.map((leader, index) => {
              const isCurrentUser = leader.id === currentUserId;
              
              let RankIcon = null;
              if (index === 0) RankIcon = Crown;
              else if (index === 1) RankIcon = Star;
              else if (index === 2) RankIcon = ArrowUp;

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={leader.id} 
                  className={`flex items-center gap-4 bg-[#0A0A0A] p-4 rounded-xl transition-all ${
                    isCurrentUser 
                      ? "border border-success/50 shadow-[0_0_20px_rgba(0,255,135,0.1)] relative overflow-hidden" 
                      : "border border-white/5 hover:border-white/10"
                  }`}
                >
                  {isCurrentUser && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-success/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
                  )}

                  <div className={`w-8 text-center font-mono text-sm ${
                    index === 0 ? 'text-warning font-bold text-lg' : 
                    index === 1 ? 'text-gray-300 font-bold' : 
                    index === 2 ? 'text-amber-600 font-bold' : 
                    'text-text-muted'
                  }`}>
                    {RankIcon ? <RankIcon className="w-5 h-5 mx-auto" /> : `#${index + 1}`}
                  </div>
                  
                  <div className="flex-1 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-[10px] uppercase font-bold border ${
                      isCurrentUser ? "bg-success/10 border-success/30 text-success" : "bg-white/5 border-white/10 text-text-secondary"
                    }`}>
                      {leader.id.substring(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${isCurrentUser ? "text-white" : "text-white/80"}`}>
                          User_{leader.id.substring(0, 6)}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[9px] bg-success text-black px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-text-muted font-mono">{code} Region</span>
                        {leader.streak_count > 0 && (
                          <>
                            <span className="text-[10px] text-text-muted">·</span>
                            <span className="text-[10px] text-warning font-mono flex items-center gap-0.5">
                              🔥 {leader.streak_count} Streak
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[9px] text-text-muted uppercase tracking-widest font-mono mb-1">Protected</div>
                    <div className="font-bold font-numeric text-base text-success tracking-tight">
                      {formatCurrency(leader.total_fees_prevented, currency)}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
