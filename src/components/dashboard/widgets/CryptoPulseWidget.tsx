import { TrendingUp, TrendingDown } from "lucide-react";
import { useAuthSource as useAuthSafe } from "@/hooks/useAuthSource";
import { useDataQuery } from "@/lib/data-layer";
import { computePortfolio, type HoldingRow } from "@/lib/dashboard-metrics";
import { WidgetEmpty } from "./WidgetEmpty";

/**
 * Phase 4 M5 — Canvas Dashboard 3.0. Portfolio value, unrealized P/L vs cost
 * basis, and top mover. Reads `crypto_holdings` via the data-layer.
 */
export default function CryptoPulseWidget() {
  const { user } = useAuthSafe();
  const { data } = useDataQuery<HoldingRow>("crypto_holdings", {
    queryOptions: {
      select: ["coin_symbol", "quantity", "avg_buy_price", "current_price"],
      filters: [{ column: "user_id", operator: "eq", value: user?.id ?? "" }],
    },
    enabled: !!user,
  });

  const holdings = (data?.data as HoldingRow[] | null) ?? [];
  const { totalValue, changePct, topMover } = computePortfolio(holdings);
  const up = changePct >= 0;

  if (holdings.length === 0) {
    return <WidgetEmpty message="No holdings yet" />;
  }

  return (
    <div className="flex h-full flex-col justify-center gap-2">
      <div>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Portfolio</p>
        <p className="text-2xl font-bold text-foreground tabular-nums">
          ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span className={`flex items-center gap-1 font-medium ${up ? "text-success" : "text-destructive"}`}>
          {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {up ? "+" : ""}
          {changePct.toFixed(1)}%
        </span>
        {topMover && (
          <span className="text-muted-foreground truncate">
            Top: <span className="font-medium text-foreground">{topMover.symbol}</span>{" "}
            {topMover.changePct >= 0 ? "+" : ""}
            {topMover.changePct.toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );
}
