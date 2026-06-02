-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id uuid REFERENCES auth.users PRIMARY KEY,
  email text,
  is_pro boolean DEFAULT false,
  tier text DEFAULT 'free',
  full_name text,
  phone text,
  pro_expires_at timestamptz,
  scan_count_today int DEFAULT 0,
  scan_date date DEFAULT CURRENT_DATE,
  streak_count int DEFAULT 0,
  longest_streak int DEFAULT 0,
  total_fees_prevented decimal DEFAULT 0,
  referral_code text UNIQUE,
  referred_by uuid REFERENCES public.users(id),
  ai_report text,
  ai_report_at timestamptz,
  alerts_enabled boolean DEFAULT true,
  companion_name text,
  companion_skin text DEFAULT 'orange' CHECK (companion_skin IN ('orange', 'black', 'white', 'calico', 'grey')),
  ai_tone text DEFAULT 'hype' CHECK (ai_tone IN ('hype', 'roast')),
  wallet_balance decimal DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies for users
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Payments table
CREATE TABLE public.payments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  provider_name text NOT NULL, -- Will store encrypted string
  amount_due text NOT NULL, -- Will store encrypted string
  currency text DEFAULT 'GBP',
  due_date date NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  created_at timestamptz DEFAULT now(),
  paid_at timestamptz,
  notified_at timestamptz
);

-- Enable RLS for payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policies for payments
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments" ON public.payments
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete own payments" ON public.payments
  FOR DELETE USING (auth.uid() = user_id);

-- AUTO-PROVISION: Create a public.users row when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Generate a random 6-character referral code
  INSERT INTO public.users (id, email, referral_code)
  VALUES (
    NEW.id, 
    NEW.email, 
    SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 6)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Community Forums

CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) NOT NULL,
  content text NOT NULL,
  upvotes int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.users(id) NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- RLS for Community

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read posts
CREATE POLICY "Anyone can view posts" ON public.posts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users can insert their own posts
CREATE POLICY "Users can insert their own posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Anyone authenticated can read comments
CREATE POLICY "Anyone can view comments" ON public.comments
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users can insert their own comments
CREATE POLICY "Users can insert their own comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
