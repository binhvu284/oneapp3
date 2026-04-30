import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PortfolioChart } from "./PortfolioChart";
import { FearGreedGauge } from "./FearGreedGauge";
import { CryptoHolding } from "@/hooks/useCryptoPortfolio";
import { CryptoTransaction } from "@/hooks/useCryptoTransactions";
import { CoinPrice } from "@/hooks/useCryptoPrices";

interface CryptoOverviewProps {
  holdings: CryptoHolding[];
  transactions: CryptoTransaction[];
  prices: Record<string, CoinPrice>;
  isLoading: boolean;
}

const COIN_ID_MAP: Record<string, string> = {
  BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', BNB: 'binancecoin', XRP: 'ripple',
  DOGE: 'dogecoin', ADA: 'cardano', DOT: 'polkadot', MATIC: 'polygon', AVAX: 'avalanche-2',
};

export function CryptoOverview({ holdings, transactions, prices, isLoading }: CryptoOverviewProps) {
  // Calculate total portfolio value
  const totalValue = holdings.reduce((sum, h) => {
    const coinId = COIN_ID_MAP[h.coin_symbol.toUpperCase()] || h.coin_symbol.toLowerCase();
    const price = prices[coinId]?.usd || h.current_price || h.avg_buy_price;
    return sum + h.quantity * price;
  }, 0);

  const totalCost = holdings.reduce((sum, h) => sum + h.quantity * h.avg_buy_price, 0);
  const pnl = totalValue - totalCost;
  const pnlPercent = totalCost > 0 ? (pnl / totalCost) * 100 : 0;

  // USD to VND rate from prices
  const btcVnd = prices['bitcoin']?.vnd || 0;
  const btcUsd = prices['bitcoin']?.usd || 1;
  const usdToVnd = btcUsd > 0 ? btcVnd / btcUsd : 25000;
  const totalVnd = totalValue * usdToVnd;

  const recentTx = transactions.slice(0, 5);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Balance + P&L */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="h-4 w-4" /> Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {totalVnd.toLocaleString('vi-VN', { minimumFractionDigits: 0 })} VND
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              {pnl >= 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
              Profit / Loss
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${pnl >= 0 ? 'text-green-500' : 'text-destructive'}`}>
              {pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
            </div>
            <div className={`text-sm mt-1 ${pnl >= 0 ? 'text-green-500/70' : 'text-destructive/70'}`}>
              {pnl >= 0 ? '+' : ''}${pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PortfolioChart holdings={holdings} />
        <FearGreedGauge />
      </div>

      {/* Top Holdings + Recent Transactions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Holdings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {holdings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No holdings yet. Add transactions to get started.</p>
            ) : (
              holdings.slice(0, 5).map(h => {
                const coinId = COIN_ID_MAP[h.coin_symbol.toUpperCase()] || h.coin_symbol.toLowerCase();
                const price = prices[coinId]?.usd || h.current_price || 0;
                const value = h.quantity * price;
                return (
                  <div key={h.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                    <div>
                      <span className="font-medium text-sm">{h.coin_symbol.toUpperCase()}</span>
                      <span className="text-xs text-muted-foreground ml-2">{h.quantity}</span>
                    </div>
                    <span className="text-sm font-medium">${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentTx.length === 0 ? (
              <p className="text-sm text-muted-foreground">No transactions yet.</p>
            ) : (
              recentTx.map(tx => (
                <div key={tx.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                      tx.transaction_type === 'buy' ? 'bg-green-500/10 text-green-500' :
                      tx.transaction_type === 'sell' ? 'bg-destructive/10 text-destructive' :
                      'bg-primary/10 text-primary'
                    }`}>
                      {tx.transaction_type.toUpperCase()}
                    </span>
                    <span className="text-sm font-medium">{tx.coin_symbol.toUpperCase()}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">${tx.total_value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
