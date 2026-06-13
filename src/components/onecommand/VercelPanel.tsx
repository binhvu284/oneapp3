import { Rocket, RefreshCw, ExternalLink, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useOneCommandIntegrations } from "@/hooks/useOneCommandIntegrations";
import { useAuthSource as useAuthSafe } from "@/hooks/useAuthSource";
import { vercelProxy, deploymentBadge } from "@/lib/onecommand-utils";
import { formatRelativeTime } from "@/lib/dashboard-metrics";
import { toast } from "sonner";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Deployment {
  uid: string;
  name: string;
  url: string;
  state: string;
  createdAt: number;
  meta?: { githubCommitMessage?: string };
}

export function VercelPanel() {
  const { user } = useAuthSafe();
  const { integrations, isLoading: intLoading } = useOneCommandIntegrations();
  const qc = useQueryClient();
  const [activeProject, setActiveProject] = useState<string>("");

  const vercelIntegrations = integrations.filter(
    (i) => i.type === "vercel" || i.type === "both"
  );
  const selectedProjectId = activeProject || vercelIntegrations[0]?.vercel_project_id || "";

  const deploymentsQuery = useQuery({
    queryKey: ["vercel-deployments", user?.id, selectedProjectId],
    queryFn: async () => {
      if (!user?.id || !selectedProjectId) return { deployments: [] };
      return vercelProxy(user.id, "list-deployments", { project_id: selectedProjectId }) as Promise<{ deployments: Deployment[] }>;
    },
    enabled: !!user && !!selectedProjectId,
    refetchInterval: 30_000,
  });

  const rollback = useMutation({
    mutationFn: async (deploymentId: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      return vercelProxy(user.id, "rollback", {
        project_id: selectedProjectId,
        deployment_id: deploymentId,
      });
    },
    onSuccess: () => {
      toast.success("Rollback triggered");
      qc.invalidateQueries({ queryKey: ["vercel-deployments", user?.id, selectedProjectId] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Rollback failed"),
  });

  const redeploy = useMutation({
    mutationFn: async (deploymentId: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      return vercelProxy(user.id, "redeploy", { deployment_id: deploymentId });
    },
    onSuccess: () => {
      toast.success("Redeploy triggered");
      qc.invalidateQueries({ queryKey: ["vercel-deployments", user?.id, selectedProjectId] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Redeploy failed"),
  });

  function refresh() {
    qc.invalidateQueries({ queryKey: ["vercel-deployments", user?.id, selectedProjectId] });
  }

  if (intLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
        <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading…
      </div>
    );
  }

  if (vercelIntegrations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
        <Rocket className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No Vercel projects configured.</p>
        <p className="text-xs text-muted-foreground">
          Add a project in OneCommand Settings with a Vercel project ID and token.
        </p>
      </div>
    );
  }

  const deployments: Deployment[] = deploymentsQuery.data?.deployments ?? [];
  const latest = deployments[0] ?? null;
  const previous = deployments[1] ?? null;

  return (
    <div className="flex flex-col gap-6">
      {/* Project selector + refresh */}
      <div className="flex items-center gap-3">
        <Select value={selectedProjectId} onValueChange={setActiveProject}>
          <SelectTrigger className="w-[240px] h-8 text-xs">
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            {vercelIntegrations.map((i) =>
              i.vercel_project_id ? (
                <SelectItem key={i.id} value={i.vercel_project_id} className="text-xs">
                  {i.project_name}
                </SelectItem>
              ) : null
            )}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="ghost"
          onClick={refresh}
          disabled={deploymentsQuery.isFetching}
          className="h-8"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${deploymentsQuery.isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Latest deployment hero */}
      {latest && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-foreground">Latest Deployment</span>
                {(() => {
                  const b = deploymentBadge(latest.state);
                  return <span className={`text-xs font-medium ${b.color}`}>{b.label}</span>;
                })()}
              </div>
              <p className="text-xs text-muted-foreground truncate max-w-[280px]">
                {latest.meta?.githubCommitMessage ?? latest.name}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {formatRelativeTime(new Date(latest.createdAt).toISOString())}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {latest.url && (
                <a href={`https://${latest.url}`} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                    <ExternalLink className="h-3 w-3" /> Preview
                  </Button>
                </a>
              )}
              {previous && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                  onClick={() => rollback.mutate(previous.uid)}
                  disabled={rollback.isPending}
                >
                  {rollback.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <RotateCcw className="h-3 w-3" />
                  )}
                  Rollback
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Deployment history */}
      <section>
        <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
          <Rocket className="h-4 w-4 text-primary" />
          Deployment History
        </h3>
        {deployments.length === 0 ? (
          <p className="text-xs text-muted-foreground">No deployments found.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {deployments.map((dep, i) => {
              const badge = deploymentBadge(dep.state);
              return (
                <li
                  key={dep.uid}
                  className="flex items-center justify-between gap-3 rounded border border-border bg-card/50 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-foreground truncate">
                      {dep.meta?.githubCommitMessage ?? dep.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatRelativeTime(new Date(dep.createdAt).toISOString())}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-medium ${badge.color}`}>{badge.label}</span>
                    {i === 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-[10px] px-2"
                        onClick={() => redeploy.mutate(dep.uid)}
                        disabled={redeploy.isPending}
                      >
                        Redeploy
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
