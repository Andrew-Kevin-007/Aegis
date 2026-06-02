"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
  userId: string;
}

export default function ManualEntryModal({ isOpen, onClose, onAdded, userId }: ManualEntryModalProps) {
  const [provider, setProvider] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      
      const payload = {
        user_id: userId,
        provider_name: provider, // In reality, this should be encrypted before transit
        amount_due: amount,
        currency: "GBP",
        due_date: new Date(dueDate).toISOString(),
        status: "pending"
      };

      const { error } = await supabase.from("payments").insert(payload);
      
      if (error) throw error;
      
      toast.success("Liability added to your Shield.");
      onAdded();
      onClose();
    } catch (err) {
      toast.error("Failed to add liability.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm bg-surface border border-border rounded-2xl p-6 relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-text-primary">
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-medium tracking-tight text-text-primary mb-6">Add Manual Liability</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-mono text-text-muted mb-1 block">Provider (Klarna, Clearpay, etc)</label>
            <Input 
              value={provider} 
              onChange={(e) => setProvider(e.target.value)} 
              placeholder="e.g. Klarna" 
              required
              className="w-full"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-mono text-text-muted mb-1 block">Amount Due</label>
            <Input 
              type="number"
              step="0.01"
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              placeholder="0.00" 
              required
              className="w-full"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-mono text-text-muted mb-1 block">Due Date</label>
            <Input 
              type="date"
              value={dueDate} 
              onChange={(e) => setDueDate(e.target.value)} 
              required
              className="w-full"
            />
          </div>
          <div className="pt-2">
            <Button type="submit" fullWidth isLoading={loading} icon={<Plus className="w-4 h-4" />}>
              Add to Shield
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
