import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";
import { FearGreedGauge } from "./FearGreedGauge";

interface MarketCoin {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  image: string;
}

export function CryptoMarket() {
  const [coins, setCoins] = useState<MarketCoin[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crypto-market?action=top-coins`,
          { headers: { 'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
        );
        if (!response.ok) throw new Error('Failed');
        const data = await response.json();
        setCoins(data || []);
      } catch (err) {
        console.error('Error fetching market data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCoins();
  }, []);

  return (
    <div className="space-y-4">
      <FearGreedGauge />

      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Top Coins by Market Cap</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12" />)}</div>
          ) : (
            <div className="space-y-1">
              {coins.map((coin, i) => (
                <div key={coin.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-5">{i + 1}</span>
                    <img src={coin.image} alt={coin.name} className="h-6 w-6 rounded-full" />
                    <div>
                      <span className="text-sm font-medium">{coin.symbol.toUpperCase()}</span>
                      <span className="text-xs text-muted-foreground ml-1.5 hidden sm:inline">{coin.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">${coin.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span className={`text-xs font-medium flex items-center gap-0.5 w-16 justify-end ${
                      coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-destructive'
                    }`}>
                      {coin.price_change_percentage_24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
