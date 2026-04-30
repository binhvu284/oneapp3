import { Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CryptoHolding } from "@/hooks/useCryptoPortfolio";
import { CoinPrice } from "@/hooks/useCryptoPrices";

const COIN_ID_MAP: Record<string, string> = {
  BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', BNB: 'binancecoin', XRP: 'ripple',
  DOGE: 'dogecoin', ADA: 'cardano', DOT: 'polkadot', MATIC: 'polygon', AVAX: 'avalanche-2',
};

interface CryptoPortfolioProps {
  holdings: CryptoHolding[];
  prices: Record<string, CoinPrice>;
  isLoading: boolean;
  onDelete: (id: string) => void;
}

export function CryptoPortfolio({ holdings, prices, isLoading, onDelete }: CryptoPortfolioProps) {
  if (isLoading) {
    return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20" />)}</div>;
  }

  if (holdings.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No holdings yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Add transactions to automatically track your portfolio.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="hidden md:grid grid-cols-6 gap-4 px-4 text-xs font-medium text-muted-foreground uppercase">
        <span>Coin</span>
        <span className="text-right">Quantity</span>
        <span className="text-right">Avg Buy</span>
        <span className="text-right">Current</span>
        <span className="text-right">Value</span>
        <span className="text-right">P&L</span>
      </div>

      {holdings.map(h => {
        const coinId = COIN_ID_MAP[h.coin_symbol.toUpperCase()] || h.coin_symbol.toLowerCase();
        const currentPrice = prices[coinId]?.usd || h.current_price || 0;
        const value = h.quantity * currentPrice;
        const cost = h.quantity * h.avg_buy_price;
        const pnl = value - cost;
        const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
        const change24h = prices[coinId]?.usd_24h_change || 0;

        return (
          <Card key={h.id} className="border-border hover:bg-card-hover transition-colors">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-4 items-center">
                <div>
                  <span className="font-semibold text-sm">{h.coin_symbol.toUpperCase()}</span>
                  <span className="text-xs text-muted-foreground ml-1.5">{h.coin_name}</span>
                </div>
                <div className="text-right text-sm">{h.quantity}</div>
                <div className="text-right text-sm">${h.avg_buy_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                <div className="text-right">
                  <div className="text-sm">${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  <div className={`text-xs ${change24h >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                    {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
                  </div>
                </div>
                <div className="text-right text-sm font-medium">${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                <div className="text-right flex items-center justify-end gap-2">
                  <div>
                    <div className={`text-sm font-medium ${pnl >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                      {pnl >= 0 ? '+' : ''}${pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className={`text-xs ${pnl >= 0 ? 'text-green-500/70' : 'text-destructive/70'}`}>
                      {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => onDelete(h.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
