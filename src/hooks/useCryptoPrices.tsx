import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CoinPrice {
  id: string;
  usd: number;
  vnd: number;
  usd_24h_change: number;
  usd_market_cap: number;
}

export function useCryptoPrices(coinIds: string = 'bitcoin,ethereum,solana,binancecoin,ripple') {
  const [prices, setPrices] = useState<Record<string, CoinPrice>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async (showLoadingState = true) => {
    try {
      if (showLoadingState) setIsLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crypto-prices?coins=${coinIds}&currency=usd,vnd`,
        { headers: { 'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
      );

      if (!response.ok) throw new Error('Failed to fetch prices');
      const priceData = await response.json();

      const formatted: Record<string, CoinPrice> = {};
      for (const [id, values] of Object.entries(priceData)) {
        const v = values as any;
        formatted[id] = {
          id,
          usd: v.usd || 0,
          vnd: v.vnd || 0,
          usd_24h_change: v.usd_24h_change || 0,
          usd_market_cap: v.usd_market_cap || 0,
        };
      }
      setPrices(formatted);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching prices:', err);
      setError(err.message);
    } finally {
      if (showLoadingState) setIsLoading(false);
    }
  }, [coinIds]);

  useEffect(() => {
    let mounted = true;

    // Initial fetch, show loading indicator
    fetchPrices(true);

    // Polling interval, background fetch (don't show loading indicator)
    const interval = setInterval(() => {
      if (mounted) fetchPrices(false);
    }, 60000); // refresh every 60s

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [fetchPrices]);

  return { prices, isLoading, error, refetch: () => fetchPrices(true) };
}
