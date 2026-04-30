import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { CryptoHolding } from "@/hooks/useCryptoPortfolio";

const COLORS = [
  'hsl(199 89% 48%)', 'hsl(142 76% 36%)', 'hsl(38 92% 50%)',
  'hsl(280 67% 55%)', 'hsl(0 84% 60%)', 'hsl(200 70% 60%)',
  'hsl(160 60% 45%)', 'hsl(30 80% 55%)',
];

interface PortfolioChartProps {
  holdings: CryptoHolding[];
}

export function PortfolioChart({ holdings }: PortfolioChartProps) {
  const data = holdings
    .filter(h => h.quantity > 0)
    .map(h => ({
      name: h.coin_symbol.toUpperCase(),
      value: h.quantity * (h.current_price || h.avg_buy_price),
    }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Asset Allocation</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          No holdings yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Asset Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              contentStyle={{ background: 'hsl(0 0% 8%)', border: '1px solid hsl(0 0% 21%)', borderRadius: '8px', color: 'hsl(210 40% 98%)' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
