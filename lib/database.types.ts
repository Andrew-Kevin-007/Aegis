export interface DBUser {
  id: string;
  email: string;
  is_pro: boolean;
  tier: "free" | "pro" | "elite";
  full_name: string | null;
  phone: string | null;
  pro_expires_at: string | null;
  scan_count_today: number;
  scan_date: string;
  streak_count: number;
  longest_streak: number;
  total_fees_prevented: number;
  referral_code: string | null;
  referred_by: string | null;
  ai_report: string | null;
  ai_report_at: string | null;
  alerts_enabled: boolean;
  companion_name: string | null;
  ai_tone: "hype" | "roast";
  companion_skin: "orange" | "black" | "white" | "calico" | "grey";
  wallet_balance: number;
  created_at: string;
}

export interface DBPayment {
  id: string;
  user_id: string;
  provider_name: string;
  amount_due: string;
  currency: string;
  due_date: string;
  late_fee: number | null;
  status: "upcoming" | "overdue" | "paid";
  alert_sent_48h: boolean;
  paid_at: string | null;
  created_at: string;
}
