import { useState } from "react";
import { Bell, BellOff, Plus, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCryptoWatchlist } from "@/hooks/useCryptoWatchlist";
import type { CoinPrice } from "@/hooks/useCryptoPrices";

const COIN_ID_MAP: Record<string, string> = {
  BTC: "bitcoin", ETH: "ethereum", SOL: "solana", BNB: "binancecoin", XRP: "ripple",
  DOGE: "dogecoin", ADA: "cardano", DOT: "polkadot", MATIC: "polygon", AVAX: "avalanche-2",
};

interface WatchlistTabProps {
  prices: Record<string, CoinPrice>;
  pricesLoading: boolean;
}

export function WatchlistTab({ prices, pricesLoading }: WatchlistTabProps) {
  const { watchlist, isLoading, addToWatchlist, removeFromWatchlist } = useCryptoWatchlist();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    coin_symbol: "",
    coin_name: "",
    alert_price_above: "",
    alert_price_below: "",
  });
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!form.coin_symbol.trim() || !form.coin_name.trim()) return;
    setAdding(true);
    try {
      await addToWatchlist({
        coin_symbol: form.coin_symbol.toUpperCase().trim(),
        coin_name: form.coin_name.trim(),
        alert_price_above: form.alert_price_above ? parseFloat(form.alert_price_above) : null,
        alert_price_below: form.alert_price_below ? parseFloat(form.alert_price_below) : null,
      });
      setForm({ coin_symbol: "", coin_name: "", alert_price_above: "", alert_price_below: "" });
      setDialogOpen(false);
    } finally {
      setAdding(false);
    }
  };

  if (isLoading || pricesLoading) {
    return <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Price Watchlist</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Track coins and set price alerts</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Coin
        </Button>
      </div>

      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg border-border bg-card/50">
          <Bell className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <p className="font-medium text-foreground">No coins in watchlist</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Add coins to monitor their prices and set alerts</p>
          <Button size="sm" className="gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            Add First Coin
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {watchlist.map((item) => {
            const coinId = COIN_ID_MAP[item.coin_symbol];
            const price = coinId ? prices[coinId] : null;
            const currentPrice = price?.usd ?? null;
            const priceChange = price?.usd_24h_change ?? null;

            const aboveAlert = item.alert_price_above !== null && currentPrice !== null && currentPrice >= item.alert_price_above;
            const belowAlert = item.alert_price_below !== null && currentPrice !== null && currentPrice <= item.alert_price_below;
            const hasAlert = aboveAlert || belowAlert;

            return (
              <div key={item.id} className={`setting-card flex items-center justify-between gap-4 ${hasAlert ? "border-yellow-500/40 bg-yellow-500/5" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {item.coin_symbol.slice(0, 3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground text-sm">{item.coin_name}</span>
                      <Badge variant="outline" className="text-xs">{item.coin_symbol}</Badge>
                      {hasAlert && (
                        <Badge variant="outline" className="text-xs text-yellow-500 border-yellow-500/50 gap-1">
                          <Bell className="w-3 h-3" /> Alert
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {currentPrice !== null ? (
                        <span className="text-sm font-semibold text-foreground">${currentPrice.toLocaleString()}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Price not available</span>
                      )}
                      {priceChange !== null && (
                        <span className={`text-xs flex items-center gap-0.5 ${priceChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {priceChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {Math.abs(priceChange).toFixed(2)}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      {item.alert_price_above !== null && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          Alert above ${item.alert_price_above.toLocaleString()}
                        </span>
                      )}
                      {item.alert_price_below !== null && (
                        <span className="flex items-center gap-1">
                          <TrendingDown className="w-3 h-3 text-red-500" />
                          Alert below ${item.alert_price_below.toLocaleString()}
                        </span>
                      )}
                      {item.alert_price_above === null && item.alert_price_below === null && (
                        <span className="flex items-center gap-1">
                          <BellOff className="w-3 h-3" />
                          No alert set
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                  onClick={() => removeFromWatchlist(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Coin to Watchlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Symbol *</Label>
                <Input
                  placeholder="BTC"
                  value={form.coin_symbol}
                  onChange={e => setForm(f => ({ ...f, coin_symbol: e.target.value.toUpperCase() }))}
                  className="uppercase"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Name *</Label>
                <Input
                  placeholder="Bitcoin"
                  value={form.coin_name}
                  onChange={e => setForm(f => ({ ...f, coin_name: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                Alert when price goes above ($)
              </Label>
              <Input
                type="number"
                placeholder="Optional"
                value={form.alert_price_above}
                onChange={e => setForm(f => ({ ...f, alert_price_above: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                Alert when price drops below ($)
              </Label>
              <Input
                type="number"
                placeholder="Optional"
                value={form.alert_price_below}
                onChange={e => setForm(f => ({ ...f, alert_price_below: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAdd}
              disabled={!form.coin_symbol.trim() || !form.coin_name.trim() || adding}
            >
              Add to Watchlist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
