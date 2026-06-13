import { useAuthSource as useAuthSafe } from "@/hooks/useAuthSource";
import { useDataQuery, useDataUpsert } from "@/lib/data-layer";

interface TokenRow {
  id: string;
  user_id: string;
  github_pat: string | null;
  vercel_token: string | null;
}

export function useOneCommandTokens() {
  const { user } = useAuthSafe();

  const query = useDataQuery<TokenRow>("user_api_keys", {
    queryOptions: {
      select: ["id", "user_id", "github_pat", "vercel_token"],
      filters: [{ column: "user_id", operator: "eq", value: user?.id ?? "" }],
      single: true,
    },
    enabled: !!user,
  });

  const upsert = useDataUpsert<TokenRow & { user_id: string }>("user_api_keys");

  const tokens = query.data?.data as TokenRow | null;

  async function saveTokens(githubPat?: string, vercelToken?: string) {
    if (!user) throw new Error("Not authenticated");
    const patch: Record<string, string | null> = { user_id: user.id };
    if (githubPat !== undefined) patch.github_pat = githubPat || null;
    if (vercelToken !== undefined) patch.vercel_token = vercelToken || null;
    await upsert.mutateAsync({
      data: patch as TokenRow & { user_id: string },
      conflictColumns: ["user_id"],
    });
  }

  return {
    githubPat: tokens?.github_pat ?? null,
    vercelToken: tokens?.vercel_token ?? null,
    isLoading: query.isLoading,
    saveTokens,
    isSaving: upsert.isPending,
  };
}
