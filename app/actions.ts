"use server";

import { createClient } from "@/lib/supabase/server";
import { decrypt, encrypt } from "@/lib/encryption";
import type { DBPayment } from "@/lib/database.types";

export async function fetchUserPayments(): Promise<DBPayment[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", user.id)
    .order("due_date", { ascending: true });

  if (error || !data) return [];

  // Decrypt sensitive fields before sending to client
  return data.map((payment: any) => ({
    ...payment,
    provider_name: decrypt(payment.provider_name),
    amount_due: decrypt(payment.amount_due),
  }));
}

export async function addManualPayment(provider: string, amount: string, due_date: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  // Check tier
  const { data: profile } = await supabase.from("users").select("tier").eq("id", user.id).single();
  const tier = profile?.tier || "free";
  
  if (tier === "free") {
    const { count } = await supabase.from("payments").select("*", { count: "exact" }).eq("user_id", user.id).neq("status", "paid");
    if (count !== null && count >= 3) {
      throw new Error("Free tier limit reached. Upgrade to track more active payments.");
    }
  }

  const { data, error } = await supabase.from("payments").insert({
    user_id: user.id,
    provider_name: encrypt(provider),
    amount_due: encrypt(amount),
    due_date,
    status: "pending"
  }).select().single();

  if (error) throw new Error("Database error");
  
  return {
    ...data,
    provider_name: decrypt(data.provider_name),
    amount_due: decrypt(data.amount_due)
  };
}

export async function addDemoPayments() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const demoData = [
    { provider_name: encrypt("Klarna (ASOS Order)"), amount_due: encrypt("45.00"), currency: "GBP", due_date: new Date(Date.now() + 3 * 86400000).toISOString(), status: "pending" },
    { provider_name: encrypt("Afterpay (Nike Sneakers)"), amount_due: encrypt("120.00"), currency: "GBP", due_date: new Date(Date.now() - 2 * 86400000).toISOString(), status: "overdue" },
  ];

  const dbInserts = demoData.map(p => ({
    ...p,
    user_id: user.id
  }));

  const { error } = await supabase.from("payments").insert(dbInserts);
  if (error) {
    console.error("Demo insert error:", error);
    throw new Error("Failed to insert demo payments.");
  }
}
