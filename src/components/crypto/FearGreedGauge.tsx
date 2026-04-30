import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface FearGreedData {
  value: string;
  value_classification: string;
  timestamp: string;
}

export function FearGreedGauge() {
  const [data, setData] = useState<FearGreedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crypto-market?action=fear-greed`,
          { headers: { 'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
        );
        if (!response.ok) throw new Error('Failed');
        const result = await response.json();
        if (result.data?.[0]) setData(result.data[0]);
      } catch (err) {
        console.error('Error fetching fear & greed:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const value = data ? parseInt(data.value) : 50;
  const getColor = (v: number) => {
    if (v <= 25) return 'text-destructive';
    if (v <= 45) return 'text-orange-400';
    if (v <= 55) return 'text-yellow-400';
    if (v <= 75) return 'text-emerald-400';
    return 'text-green-500';
  };

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Fear & Greed</CardTitle>
        </CardHeader>
        <CardContent><Skeleton className="h-16 w-full" /></CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Fear & Greed Index</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-1">
        <span className={`text-4xl font-bold ${getColor(value)}`}>{value}</span>
        <span className="text-sm text-muted-foreground capitalize">
          {data?.value_classification || 'N/A'}
        </span>
        <div className="w-full h-2 rounded-full bg-muted mt-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${value}%`,
              background: `linear-gradient(90deg, hsl(0 84% 60%), hsl(38 92% 50%), hsl(142 76% 36%))`,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
