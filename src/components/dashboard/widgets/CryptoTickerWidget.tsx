import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { useCryptoPortfolio } from "@/hooks/useCryptoPortfolio";

interface CoinData {
  symbol: string;
  price: number;
  change: number;
  sparkline: number[];
}

function MiniSparkline({ data, positive }: { data: number[]; positive: boolean }) {
  if (!data?.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 50;
  const h = 16;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "hsl(var(--chart-2))" : "hsl(var(--destructive))"}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const DEFAULT_COINS = ["bitcoin", "ethereum", "solana"];

export default function CryptoTickerWidget() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const { holdings, isLoading: isHoldingsLoading } = useCryptoPortfolio();

  useEffect(() => {
    if (isHoldingsLoading) return;

    let mounted = true;

    const fetchPrices = async () => {
      try {
        // Find top 3 symbols the user holds by quantity
        const heldSymbols = holdings
          .filter(h => h.quantity > 0)
          .sort((a, b) => b.quantity * b.current_price - a.quantity * a.current_price) // Value based sorting
          .map(h => h.coin_name.toLowerCase())
          .slice(0, 3);

        const targetIds = heldSymbols.length > 0 ? heldSymbols : DEFAULT_COINS;

        // Sometimes coin_name is Bitcoin or "bitcoin", coingecko requires exact IDs
        // For robustness, hardcoding top coins if the user's portfolio symbols don't match exactly.
        // A robust solution would map symbols to gecko ids.
        const mappedIds = targetIds.map(t => {
          if (t === 'btc') return 'bitcoin';
          if (t === 'eth') return 'ethereum';
          if (t === 'sol') return 'solana';
          if (t === 'bnb') return 'binancecoin';
          if (t === 'usdt') return 'tether';
          return t;
        });

        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${mappedIds.join(",")}&sparkline=true&price_change_percentage=24h`
        );
        const data = await res.json();

        if (!mounted || !Array.isArray(data)) return;

        const map: Record<string, string> = { bitcoin: "BTC", ethereum: "ETH", solana: "SOL", tether: "USDT", binancecoin: "BNB" };
        setCoins(
          data.map((c: any) => ({
            symbol: map[c.id] || c.symbol.toUpperCase(),
            price: c.current_price ?? 0,
            change: c.price_change_percentage_24h ?? 0,
            sparkline: (c.sparkline_in_7d?.price ?? []).slice(-24),
          }))
        );
      } catch {
        // keep old data on error
      } finally {
        if (mounted) setIsFetching(false);
      }
    };

    fetchPrices();
    const id = setInterval(fetchPrices, 120000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [holdings, isHoldingsLoading]);

  if (isHoldingsLoading || isFetching) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 h-full justify-center w-full">
      {coins.map((coin) => (
        <div key={coin.symbol} className="flex items-center justify-between px-1 gap-2">
          <span className="text-xs font-semibold text-foreground w-8 shrink-0">{coin.symbol}</span>
          <MiniSparkline data={coin.sparkline} positive={coin.change >= 0} />
          <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-end">
            <div className="flex flex-col items-end">
              <span className="text-xs text-foreground font-mono">
                ${coin.price > 0 ? coin.price.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—"}
              </span>
              {coin.price > 0 && (
                <span className={`text-[10px] flex items-center gap-0.5 ${coin.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {coin.change >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                  {Math.abs(coin.change).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
