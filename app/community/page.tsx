"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import { ChevronLeft, MessageSquare, Trophy, ThumbsUp, Send } from "lucide-react";
import { toast, Toaster } from "sonner";
import Input from "@/components/ui/Input";

interface Post {
  id: string;
  user_id: string;
  content: string;
  upvotes: number;
  created_at: string;
}

interface LeaderboardUser {
  id: string;
  total_fees_prevented: number;
  streak_count: number;
}

export default function CommunityPage() {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<"board" | "leaderboard">("board");
  const [posts, setPosts] = useState<Post[]>([]);
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Fetch posts
      const { data: postsData } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (postsData) setPosts(postsData);

      // Fetch leaderboard
      const { data: leaderData } = await supabase
        .from("users")
        .select("id, total_fees_prevented, streak_count")
        .order("total_fees_prevented", { ascending: false })
        .limit(10);
      
      if (leaderData) setLeaders(leaderData);
      
      setLoading(false);
    }
    load();
  }, [supabase]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to post.");
      return;
    }

    const { data, error } = await supabase
      .from("posts")
      .insert({ user_id: user.id, content: newPost.trim() })
      .select()
      .single();

    if (error) {
      toast.error("Failed to post.");
    } else if (data) {
      setPosts([data, ...posts]);
      setNewPost("");
      toast.success("Posted to community board!");
    }
  };

  const handleUpvote = async (postId: string, currentUpvotes: number) => {
    const { error } = await supabase
      .from("posts")
      .update({ upvotes: currentUpvotes + 1 })
      .eq("id", postId);

    if (!error) {
      setPosts(posts.map(p => p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p));
    }
  };

  return (
    <main className="min-h-screen bg-background text-text-primary px-6 py-12 relative overflow-hidden">
      <Toaster theme="dark" closeButton />
      
      <button 
        onClick={() => router.push("/dashboard")} 
        className="absolute top-8 left-8 text-text-secondary hover:text-white flex items-center gap-2 font-mono text-xs uppercase z-10"
      >
        <ChevronLeft className="w-4 h-4" /> Dashboard
      </button>

      <div className="max-w-2xl mx-auto z-10 relative">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">Community</h1>
          <p className="text-text-secondary text-sm mt-2">
            Ask questions, share victories, and see who is crushing the most debt.
          </p>
        </div>

        <div className="flex items-center gap-4 border-b border-white/5 mb-8">
          <button 
            onClick={() => setActiveTab("board")}
            className={`pb-3 text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "board" ? "text-white border-b-2 border-white" : "text-text-muted hover:text-white"}`}
          >
            <MessageSquare className="w-4 h-4" /> Global Feed
          </button>
          <button 
            onClick={() => setActiveTab("leaderboard")}
            className={`pb-3 text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "leaderboard" ? "text-white border-b-2 border-white" : "text-text-muted hover:text-white"}`}
          >
            <Trophy className="w-4 h-4" /> Leaderboard
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-pulse w-32 h-4 bg-white/5 rounded" />
          </div>
        ) : (
          <>
            {activeTab === "board" && (
              <div className="space-y-6">
                <form onSubmit={handlePost} className="flex gap-2">
                  <Input 
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Ask a question or share a victory..."
                    className="flex-1"
                  />
                  <Button type="submit" icon={<Send className="w-4 h-4" />}>Post</Button>
                </form>

                <div className="space-y-4">
                  {posts.length === 0 ? (
                    <div className="text-center py-10 text-text-muted text-sm border border-white/5 border-dashed rounded-xl">
                      Be the first to post.
                    </div>
                  ) : posts.map(post => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={post.id} 
                      className="bg-[#0A0A0A] border border-white/5 rounded-xl p-5"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center font-mono text-[8px] uppercase">
                            {post.user_id.substring(0, 2)}
                          </div>
                          <span className="text-xs text-text-secondary font-mono">User_{post.user_id.substring(0, 4)}</span>
                        </div>
                        <span className="text-xs text-text-muted">{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-white leading-relaxed mb-4">{post.content}</p>
                      
                      <button 
                        onClick={() => handleUpvote(post.id, post.upvotes)}
                        className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-white transition-colors"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {post.upvotes}
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "leaderboard" && (
              <div className="space-y-3">
                {leaders.length === 0 ? (
                  <div className="text-center py-10 text-text-muted text-sm border border-white/5 border-dashed rounded-xl">
                    No leaders yet.
                  </div>
                ) : leaders.map((leader, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={leader.id} 
                    className="flex items-center gap-4 bg-[#0A0A0A] border border-white/5 p-4 rounded-xl"
                  >
                    <div className={`w-8 text-center font-mono text-sm ${index === 0 ? 'text-warning font-bold' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-600' : 'text-text-muted'}`}>
                      #{index + 1}
                    </div>
                    <div className="flex-1 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-mono text-[10px] uppercase">
                        {leader.id.substring(0, 2)}
                      </div>
                      <span className="text-sm font-medium">Aegis_User_{leader.id.substring(0, 4)}</span>
                      {leader.streak_count > 0 && (
                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white ml-2">🔥 {leader.streak_count}</span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-text-muted uppercase tracking-widest font-mono mb-1">Protected</div>
                      <div className="font-semibold text-success">£{leader.total_fees_prevented.toFixed(2)}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
