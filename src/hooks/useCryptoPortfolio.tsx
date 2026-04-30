import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource as useAuth } from "@/hooks/useAuthSource";
import { toast } from "@/hooks/use-toast";

export interface CryptoHolding {
  id: string;
  user_id: string;
  platform_id: string | null;
  coin_symbol: string;
  coin_name: string;
  quantity: number;
  avg_buy_price: number;
  current_price: number;
  created_at: string;
  updated_at: string;
}

export function useCryptoPortfolio() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: holdings = [], isLoading } = useQuery<CryptoHolding[]>({
    queryKey: ["crypto_holdings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crypto_holdings")
        .select("*")
        .eq("user_id", user!.id)
        .order("coin_symbol", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CryptoHolding[];
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async (holding: Omit<CryptoHolding, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("crypto_holdings")
        .insert({ ...holding, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data as CryptoHolding;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crypto_holdings", user?.id] });
      toast({ title: "Success", description: "Holding added" });
    },
    onError: () => toast({ title: "Error", description: "Failed to add holding", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("crypto_holdings").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crypto_holdings", user?.id] });
      toast({ title: "Deleted", description: "Holding removed" });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete", variant: "destructive" }),
  });

  return {
    holdings,
    isLoading,
    addHolding: addMutation.mutateAsync,
    deleteHolding: (id: string) => deleteMutation.mutate(id),
    refetch: () => queryClient.invalidateQueries({ queryKey: ["crypto_holdings", user?.id] }),
  };
}
