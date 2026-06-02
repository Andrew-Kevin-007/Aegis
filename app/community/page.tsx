"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import { ChevronLeft, MessageSquare, ThumbsUp, Send } from "lucide-react";
import { toast, Toaster } from "sonner";
import Input from "@/components/ui/Input";

interface Post {
  id: string;
  user_id: string;
  content: string;
  upvotes: number;
  created_at: string;
}

export default function CommunityPage() {
  const router = useRouter();
  const supabase = createClient();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"feed" | "squad">("feed");

  useEffect(() => {
    async function load() {
      // Fetch posts
      const { data: postsData } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
      
      if (postsData) setPosts(postsData);
      
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
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Community Feed</h1>
          <p className="text-text-secondary text-sm mt-2 font-mono tracking-wide">
            Ask questions, share victories, protect your credit.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-pulse w-32 h-4 bg-white/5 rounded" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex bg-[#050505] p-1 rounded-xl border border-white/5 mb-8 w-fit mx-auto">
              <button 
                onClick={() => setActiveTab("feed")} 
                className={`px-6 py-2 rounded-lg text-xs font-mono uppercase tracking-widest transition-all ${activeTab === "feed" ? "bg-white/10 text-white" : "text-text-muted hover:text-white"}`}
              >
                Global Feed
              </button>
              <button 
                onClick={() => setActiveTab("squad")} 
                className={`px-6 py-2 rounded-lg text-xs font-mono uppercase tracking-widest transition-all ${activeTab === "squad" ? "bg-white/10 text-white" : "text-text-muted hover:text-white"}`}
              >
                My Squad
              </button>
            </div>

            {activeTab === "feed" ? (
              <>
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
              </>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="bg-[#050505] border border-white/5 rounded-2xl p-6 text-center">
                  <h2 className="text-xl font-medium tracking-tight text-white mb-2">Debt-Free Pods</h2>
                  <p className="text-sm text-text-muted mb-6">Finance is multiplayer. If one squad member misses a payment, the whole pod's health score drops. Hold each other accountable.</p>
                  
                  <div className="flex justify-center items-center gap-8 mb-8">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-14 h-14 rounded-full border-2 border-success bg-success/10 flex items-center justify-center font-mono text-sm text-success font-bold">YOU</div>
                      <span className="text-[10px] font-mono text-success uppercase tracking-widest">Safe</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 opacity-50">
                      <div className="w-14 h-14 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center font-mono text-xl">+</div>
                      <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Invite</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 opacity-50">
                      <div className="w-14 h-14 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center font-mono text-xl">+</div>
                      <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Invite</span>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 mb-6">
                    <p className="font-mono text-xs text-text-secondary mb-1 uppercase tracking-widest">Pod Health Score</p>
                    <p className="font-bold text-3xl font-numeric text-white">99<span className="text-lg text-text-muted">/100</span></p>
                  </div>

                  <Button onClick={() => toast.success("Invite link copied!")} fullWidth className="font-mono uppercase tracking-widest text-xs">
                    Invite Friends to Pod
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
