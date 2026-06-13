import { useState } from "react";
import { GitPullRequest, GitBranch, GitCommit, RefreshCw, ExternalLink, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOneCommandIntegrations } from "@/hooks/useOneCommandIntegrations";
import { useAuthSource as useAuthSafe } from "@/hooks/useAuthSource";
import { githubProxy, prStateBadge } from "@/lib/onecommand-utils";
import { formatRelativeTime } from "@/lib/dashboard-metrics";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface PR {
  number: number;
  title: string;
  state: string;
  user: { login: string };
  html_url: string;
  created_at: string;
  draft: boolean;
}

interface Commit {
  sha: string;
  commit: { message: string; author: { date: string; name: string } };
  html_url: string;
}

export function GitHubPanel() {
  const { user } = useAuthSafe();
  const { integrations, isLoading: intLoading } = useOneCommandIntegrations();
  const qc = useQueryClient();
  const [activeRepo, setActiveRepo] = useState<string>("");

  const githubIntegrations = integrations.filter(
    (i) => i.type === "github" || i.type === "both"
  );

  const selectedRepo = activeRepo || githubIntegrations[0]?.github_repo || "";

  const prsQuery = useQuery({
    queryKey: ["github-prs", user?.id, selectedRepo],
    queryFn: async () => {
      if (!user?.id || !selectedRepo) return { prs: [] };
      return githubProxy(user.id, "list-prs", { repo: selectedRepo }) as Promise<{ prs: PR[] }>;
    },
    enabled: !!user && !!selectedRepo,
    refetchInterval: 60_000,
  });

  const commitsQuery = useQuery({
    queryKey: ["github-commits", user?.id, selectedRepo],
    queryFn: async () => {
      if (!user?.id || !selectedRepo) return { commits: [] };
      return githubProxy(user.id, "list-commits", { repo: selectedRepo }) as Promise<{ commits: Commit[] }>;
    },
    enabled: !!user && !!selectedRepo,
    refetchInterval: 60_000,
  });

  const mergePR = useMutation({
    mutationFn: async (prNumber: number) => {
      if (!user?.id) throw new Error("Not authenticated");
      return githubProxy(user.id, "merge-pr", { repo: selectedRepo, pr_number: prNumber });
    },
    onSuccess: () => {
      toast.success("PR merged successfully");
      qc.invalidateQueries({ queryKey: ["github-prs", user?.id, selectedRepo] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Merge failed"),
  });

  function refresh() {
    qc.invalidateQueries({ queryKey: ["github-prs", user?.id, selectedRepo] });
    qc.invalidateQueries({ queryKey: ["github-commits", user?.id, selectedRepo] });
  }

  if (intLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
        <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading…
      </div>
    );
  }

  if (githubIntegrations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
        <GitPullRequest className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No GitHub repos configured.</p>
        <p className="text-xs text-muted-foreground">
          Add a project in OneCommand Settings with a GitHub repo and your PAT.
        </p>
      </div>
    );
  }

  const prs: PR[] = prsQuery.data?.prs ?? [];
  const commits: Commit[] = commitsQuery.data?.commits ?? [];
  const isLoading = prsQuery.isFetching || commitsQuery.isFetching;

  return (
    <div className="flex flex-col gap-6">
      {/* Repo selector + refresh */}
      <div className="flex items-center gap-3">
        <Select value={selectedRepo} onValueChange={setActiveRepo}>
          <SelectTrigger className="w-[240px] h-8 text-xs">
            <SelectValue placeholder="Select repository" />
          </SelectTrigger>
          <SelectContent>
            {githubIntegrations.map((i) =>
              i.github_repo ? (
                <SelectItem key={i.id} value={i.github_repo} className="text-xs">
                  {i.project_name} — {i.github_repo}
                </SelectItem>
              ) : null
            )}
          </SelectContent>
        </Select>
        <Button size="sm" variant="ghost" onClick={refresh} disabled={isLoading} className="h-8">
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Open PRs */}
      <section>
        <h3 className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-3">
          <GitPullRequest className="h-4 w-4 text-primary" />
          Open Pull Requests ({prs.length})
        </h3>
        {prs.length === 0 ? (
          <p className="text-xs text-muted-foreground">No open PRs.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {prs.map((pr) => {
              const badge = prStateBadge(pr.state);
              return (
                <li
                  key={pr.number}
                  className="flex items-start justify-between gap-3 rounded-md border border-border bg-card px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-foreground truncate">{pr.title}</span>
                      {pr.draft && <Badge variant="outline" className="text-[10px] h-4">Draft</Badge>}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      #{pr.number} · {pr.user.login} · {formatRelativeTime(pr.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-medium ${badge.color}`}>{badge.label}</span>
                    <a href={pr.html_url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </a>
                    {pr.state === "open" && !pr.draft && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-[10px] px-2"
                        onClick={() => mergePR.mutate(pr.number)}
                        disabled={mergePR.isPending}
                      >
                        {mergePR.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Merge"}
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Recent commits */}
      <section>
        <h3 className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-3">
          <GitCommit className="h-4 w-4 text-primary" />
          Recent Commits
        </h3>
        {commits.length === 0 ? (
          <p className="text-xs text-muted-foreground">No commits found.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {commits.slice(0, 10).map((c) => (
              <li key={c.sha} className="flex items-start gap-2 text-xs">
                <code className="shrink-0 text-[10px] text-muted-foreground bg-muted px-1 rounded font-mono">
                  {c.sha.slice(0, 7)}
                </code>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate">{c.commit.message.split("\n")[0]}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {c.commit.author.name} · {formatRelativeTime(c.commit.author.date)}
                  </p>
                </div>
                <a href={c.html_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
