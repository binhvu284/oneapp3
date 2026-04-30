import { supabase } from "@/integrations/supabase/client";
import { useAuthSource as useAuth } from "@/hooks/useAuthSource";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface CryptoTransaction {
  id: string;
  user_id: string;
  platform_id: string | null;
  coin_symbol: string;
  transaction_type: "buy" | "sell" | "transfer" | "receive";
  quantity: number;
  price_per_unit: number;
  total_value: number;
  currency: string;
  transaction_date: string;
  notes: string | null;
  created_at: string;
}

export interface CreateTransactionData {
  coin_symbol: string;
  transaction_type: "buy" | "sell" | "transfer" | "receive";
  quantity: number;
  price_per_unit: number;
  total_value: number;
  currency?: string;
  transaction_date?: string;
  notes?: string;
  platform_id?: string;
}

export function useCryptoTransactions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading, refetch } = useQuery({
    queryKey: ["crypto_transactions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crypto_transactions")
        .select("*")
        .eq("user_id", user!.id)
        .order("transaction_date", { ascending: false });
      if (error) throw error;
      return (data as CryptoTransaction[]) || [];
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async (txData: CreateTransactionData) => {
      if (!user) throw new Error("No user");
      const { data, error } = await supabase
        .from("crypto_transactions")
        .insert({ ...txData, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as CryptoTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crypto_transactions", user?.id] });
      toast({ title: "Success", description: "Transaction recorded" });
    },
    onError: (err) => {
      console.error("Error adding transaction:", err);
      toast({ title: "Error", description: "Failed to add transaction", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("crypto_transactions").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crypto_transactions", user?.id] });
      toast({ title: "Deleted", description: "Transaction removed" });
    },
    onError: (err) => {
      console.error("Error deleting transaction:", err);
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  });

  const addTransaction = async (txData: CreateTransactionData) => {
    try {
      return await addMutation.mutateAsync(txData);
    } catch {
      return null;
    }
  };

  const deleteTransaction = async (id: string) => {
    deleteMutation.mutate(id);
  };

  return { transactions, isLoading, addTransaction, deleteTransaction, refetch };
}
