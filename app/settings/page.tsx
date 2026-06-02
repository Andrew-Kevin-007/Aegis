"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { toast } from "sonner";
import type { DBUser } from "@/lib/database.types";

export default function AccountSettings() {
  const supabase = createClient();
  const [user, setUser] = useState<DBUser | null>(null);
  const [fullName, setFullName] = useState("");
  const [companionName, setCompanionName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data } = await supabase.from("users").select("*").eq("id", authUser.id).single();
      if (data) {
        setUser(data);
        setFullName(data.full_name || "");
        setCompanionName(data.companion_name || "");
      }
      setLoading(false);
    }
    fetchUser();
  }, [supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("users")
      .update({ full_name: fullName, companion_name: companionName })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to update account");
    } else {
      toast.success("Account details saved");
    }
    setSaving(false);
  };

  if (loading) return <div className="animate-pulse w-32 h-4 bg-border rounded" />;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary mb-2">Account</h1>
        <p className="text-sm text-text-muted">Manage your personal details and AI companion.</p>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="text-[10px] uppercase font-mono text-text-muted mb-1 block">Email (Non-editable)</label>
            <div className="bg-surface-hover px-4 py-3 rounded-lg text-sm text-text-secondary border border-border">
              {user?.email}
            </div>
          </div>
          
          <div>
            <label className="text-[10px] uppercase font-mono text-text-muted mb-1 block">Full Name</label>
            <Input 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              placeholder="e.g. Satoshi Nakamoto" 
              className="w-full"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono text-text-muted mb-1 block">Companion Name</label>
            <Input 
              value={companionName} 
              onChange={(e) => setCompanionName(e.target.value)} 
              placeholder="e.g. Buster" 
              className="w-full"
            />
            <p className="text-[10px] text-text-muted mt-2">This is the name of your roaming AI companion.</p>
          </div>

          <div className="pt-4 border-t border-border flex justify-end">
            <Button type="submit" isLoading={saving}>Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
