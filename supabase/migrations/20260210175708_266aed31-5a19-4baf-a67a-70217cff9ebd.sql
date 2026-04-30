
-- Create enum for transaction types
CREATE TYPE public.crypto_transaction_type AS ENUM ('buy', 'sell', 'transfer', 'receive');

-- Create crypto_platforms table
CREATE TABLE public.crypto_platforms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform_name TEXT NOT NULL,
  api_key_encrypted TEXT,
  api_secret_encrypted TEXT,
  wallet_address TEXT,
  is_connected BOOLEAN NOT NULL DEFAULT false,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.crypto_platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own platforms" ON public.crypto_platforms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own platforms" ON public.crypto_platforms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own platforms" ON public.crypto_platforms FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own platforms" ON public.crypto_platforms FOR DELETE USING (auth.uid() = user_id);

-- Create crypto_holdings table
CREATE TABLE public.crypto_holdings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform_id UUID REFERENCES public.crypto_platforms(id) ON DELETE SET NULL,
  coin_symbol TEXT NOT NULL,
  coin_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  avg_buy_price NUMERIC NOT NULL DEFAULT 0,
  current_price NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.crypto_holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own holdings" ON public.crypto_holdings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own holdings" ON public.crypto_holdings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own holdings" ON public.crypto_holdings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own holdings" ON public.crypto_holdings FOR DELETE USING (auth.uid() = user_id);

-- Create crypto_transactions table
CREATE TABLE public.crypto_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform_id UUID REFERENCES public.crypto_platforms(id) ON DELETE SET NULL,
  coin_symbol TEXT NOT NULL,
  transaction_type crypto_transaction_type NOT NULL,
  quantity NUMERIC NOT NULL,
  price_per_unit NUMERIC NOT NULL,
  total_value NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.crypto_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.crypto_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.crypto_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON public.crypto_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON public.crypto_transactions FOR DELETE USING (auth.uid() = user_id);

-- Create crypto_watchlist table
CREATE TABLE public.crypto_watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  coin_symbol TEXT NOT NULL,
  coin_name TEXT NOT NULL,
  alert_price_above NUMERIC,
  alert_price_below NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.crypto_watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own watchlist" ON public.crypto_watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own watchlist" ON public.crypto_watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own watchlist" ON public.crypto_watchlist FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own watchlist" ON public.crypto_watchlist FOR DELETE USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_crypto_platforms_updated_at BEFORE UPDATE ON public.crypto_platforms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_crypto_holdings_updated_at BEFORE UPDATE ON public.crypto_holdings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
