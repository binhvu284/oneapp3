import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource as useAuth } from "@/hooks/useAuthSource";
import { toast } from "@/hooks/use-toast";

export interface WatchlistItem {
  id: string;
  user_id: string;
  coin_symbol: string;
  coin_name: string;
  alert_price_above: number | null;
  alert_price_below: number | null;
  created_at: string;
}

export interface AddWatchlistData {
  coin_symbol: string;
  coin_name: string;
  alert_price_above?: number | null;
  alert_price_below?: number | null;
}

export function useCryptoWatchlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: watchlist = [], isLoading } = useQuery<WatchlistItem[]>({
    queryKey: ["crypto_watchlist", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crypto_watchlist")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as WatchlistItem[];
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async (item: AddWatchlistData) => {
      const { data, error } = await supabase
        .from("crypto_watchlist")
        .insert({ ...item, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data as WatchlistItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crypto_watchlist", user?.id] });
      toast({ title: "Added to watchlist" });
    },
    onError: () => toast({ title: "Error", description: "Failed to add to watchlist", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WatchlistItem> & { id: string }) => {
      const { error } = await supabase
        .from("crypto_watchlist")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crypto_watchlist", user?.id] });
      toast({ title: "Alert updated" });
    },
    onError: () => toast({ title: "Error", description: "Failed to update alert", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("crypto_watchlist")
        .delete()
        .eq("id", id)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crypto_watchlist", user?.id] });
      toast({ title: "Removed from watchlist" });
    },
    onError: () => toast({ title: "Error", description: "Failed to remove", variant: "destructive" }),
  });

  return {
    watchlist,
    isLoading,
    addToWatchlist: addMutation.mutateAsync,
    updateAlert: updateMutation.mutate,
    removeFromWatchlist: (id: string) => deleteMutation.mutate(id),
  };
}
