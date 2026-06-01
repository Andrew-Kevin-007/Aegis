export interface DBUser {
  id: string;
  email: string | null;
  is_pro: boolean;
  pro_expires_at: string | null;
  scan_count_today: number;
  scan_date: string;
  streak_count: number;
  longest_streak: number;
  total_fees_prevented: number;
  created_at: string;
}

export interface DBPayment {
  id: string;
  user_id: string;
  provider: string;
  item_name: string;
  amount_due: number;
  currency: string;
  due_date: string;
  late_fee: number | null;
  status: "upcoming" | "overdue" | "paid";
  alert_sent_48h: boolean;
  paid_at: string | null;
  created_at: string;
}
