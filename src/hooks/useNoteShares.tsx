import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource as useAuth } from "@/hooks/useAuthSource";
import { toast } from "@/hooks/use-toast";

export interface NoteShare {
  id: string;
  note_id: string;
  user_id: string;
  share_token: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export function useNoteShares(noteId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: shares = [], isLoading } = useQuery<NoteShare[]>({
    queryKey: ["note_shares", noteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("note_shares")
        .select("*")
        .eq("note_id", noteId!)
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as NoteShare[];
    },
    enabled: !!user && !!noteId,
  });

  const createMutation = useMutation({
    mutationFn: async ({ note_id, expires_at }: { note_id: string; expires_at?: string | null }) => {
      const { data, error } = await supabase
        .from("note_shares")
        .insert({ note_id, user_id: user!.id, expires_at: expires_at ?? null })
        .select()
        .single();
      if (error) throw error;
      return data as NoteShare;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["note_shares", vars.note_id] });
      toast({ title: "Share link created" });
    },
    onError: () => toast({ title: "Error", description: "Failed to create share link", variant: "destructive" }),
  });

  const revokeMutation = useMutation({
    mutationFn: async (shareId: string) => {
      const { error } = await supabase
        .from("note_shares")
        .update({ is_active: false })
        .eq("id", shareId)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["note_shares", noteId] });
      toast({ title: "Share link revoked" });
    },
    onError: () => toast({ title: "Error", description: "Failed to revoke link", variant: "destructive" }),
  });

  const getShareUrl = (token: string) =>
    `${window.location.origin}/note/share/${token}`;

  return {
    shares,
    isLoading,
    createShare: createMutation.mutateAsync,
    revokeShare: (id: string) => revokeMutation.mutate(id),
    getShareUrl,
    activeShares: shares.filter(s => s.is_active),
  };
}
