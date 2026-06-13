import { useAuthSource as useAuthSafe } from "@/hooks/useAuthSource";
import { useDataQuery, useDataInsert, useDataUpsert, useDataDelete } from "@/lib/data-layer";

export interface OneCommandIntegration {
  id: string;
  user_id: string;
  type: "github" | "vercel" | "both";
  project_name: string;
  github_repo: string | null;
  vercel_project_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useOneCommandIntegrations(enabled = true) {
  const { user } = useAuthSafe();

  const query = useDataQuery<OneCommandIntegration>("onecommand_integrations", {
    queryOptions: {
      select: ["id", "user_id", "type", "project_name", "github_repo", "vercel_project_id", "created_at", "updated_at"],
      filters: [{ column: "user_id", operator: "eq", value: user?.id ?? "" }],
      order: [{ column: "created_at", ascending: false }],
    },
    enabled: enabled && !!user,
  });

  const insert = useDataInsert<OneCommandIntegration>("onecommand_integrations");
  const upsert = useDataUpsert<OneCommandIntegration>("onecommand_integrations");
  const remove = useDataDelete("onecommand_integrations");

  const integrations = (query.data?.data as OneCommandIntegration[] | null) ?? [];

  async function addIntegration(payload: Omit<OneCommandIntegration, "id" | "user_id" | "created_at" | "updated_at">) {
    if (!user) throw new Error("Not authenticated");
    await insert.mutateAsync({ data: { ...payload, user_id: user.id } });
  }

  async function removeIntegration(id: string) {
    await remove.mutateAsync({
      filters: [{ column: "id", operator: "eq", value: id }],
    });
  }

  return {
    integrations,
    isLoading: query.isLoading,
    addIntegration,
    removeIntegration,
    isMutating: insert.isPending || remove.isPending,
  };
}
