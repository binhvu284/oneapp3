import { Rocket, GitPullRequest, Database, CheckSquare, ExternalLink, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthSource as useAuthSafe } from "@/hooks/useAuthSource";
import { githubProxy, vercelProxy, deploymentBadge } from "@/lib/onecommand-utils";
import { formatRelativeTime } from "@/lib/dashboard-metrics";
import { useLatestSystemConnection } from "@/hooks/useLatestSystemConnection";
import type { OneCommandIntegration } from "@/hooks/useOneCommandIntegrations";
import { useQuery } from "@tanstack/react-query";

interface ProjectStatusCardProps {
  integration: OneCommandIntegration;
}

export function ProjectStatusCard({ integration }: ProjectStatusCardProps) {
  const { user } = useAuthSafe();
  const sysConn = useLatestSystemConnection();

  const ghQuery = useQuery({
    queryKey: ["gh-stats", user?.id, integration.github_repo],
    queryFn: () =>
      githubProxy(user!.id, "get-repo-stats", { repo: integration.github_repo! }) as Promise<{
        open_issues: number;
        repo: { pushed_at: string };
      }>,
    enabled: !!user && !!(integration.github_repo) && (integration.type === "github" || integration.type === "both"),
    staleTime: 60_000,
  });

  const vercelQuery = useQuery({
    queryKey: ["vercel-latest", user?.id, integration.vercel_project_id],
    queryFn: () =>
      vercelProxy(user!.id, "list-deployments", { project_id: integration.vercel_project_id! }) as Promise<{
        deployments: Array<{ state: string; createdAt: number; url: string }>;
      }>,
    enabled: !!user && !!(integration.vercel_project_id) && (integration.type === "vercel" || integration.type === "both"),
    staleTime: 30_000,
  });

  const latestDeploy = vercelQuery.data?.deployments?.[0] ?? null;
  const deployBadge = latestDeploy ? deploymentBadge(latestDeploy.state) : null;

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">{integration.project_name}</h3>
            {integration.github_repo && (
              <p className="text-[10px] text-muted-foreground mt-0.5">{integration.github_repo}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {(ghQuery.isFetching || vercelQuery.isFetching) && (
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Deploy status */}
          <div className="flex items-start gap-2">
            <Rocket className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Last deploy</p>
              {latestDeploy ? (
                <p className={`text-xs font-medium ${deployBadge?.color}`}>
                  {deployBadge?.label}
                  <span className="text-muted-foreground font-normal ml-1">
                    {formatRelativeTime(new Date(latestDeploy.createdAt).toISOString())}
                  </span>
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">—</p>
              )}
            </div>
          </div>

          {/* Open issues */}
          <div className="flex items-start gap-2">
            <GitPullRequest className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground">Open issues</p>
              <p className="text-xs font-medium text-foreground">
                {ghQuery.data ? ghQuery.data.open_issues : "—"}
              </p>
            </div>
          </div>

          {/* DB */}
          <div className="flex items-start gap-2">
            <Database className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground">DB status</p>
              <p className="text-xs font-medium text-foreground">
                {sysConn ? (sysConn.is_active ? "Connected" : "Inactive") : "—"}
              </p>
            </div>
          </div>

          {/* Preview URL */}
          {latestDeploy?.url && (
            <div className="flex items-center gap-1.5">
              <a
                href={`https://${latestDeploy.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" /> Preview
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
