import { useState } from "react";
import { Terminal, LayoutDashboard, GitPullRequest, Rocket, Database, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FF_ONECOMMAND } from "@/lib/feature-flags";
import { Navigate } from "react-router-dom";
import { ProjectStatusCard } from "@/components/onecommand/ProjectStatusCard";
import { GitHubPanel } from "@/components/onecommand/GitHubPanel";
import { VercelPanel } from "@/components/onecommand/VercelPanel";
import { QueryRunner } from "@/components/onecommand/QueryRunner";
import { useOneCommandIntegrations } from "@/hooks/useOneCommandIntegrations";
import { useSearchParams } from "react-router-dom";

export default function OneCommand() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { integrations, isLoading } = useOneCommandIntegrations();

  if (!FF_ONECOMMAND) return <Navigate to="/" replace />;

  const defaultTab = searchParams.get("tab") ?? "dashboard";
  const initialSql = searchParams.get("sql") ?? "";

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <Terminal className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">OneCommand</h1>
            <p className="text-xs text-muted-foreground">Founder's Control Center</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate("/apps/onecommand/settings")}
          className="gap-1.5"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="mb-6 h-9">
          <TabsTrigger value="dashboard" className="text-xs gap-1.5">
            <LayoutDashboard className="h-3.5 w-3.5" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="github" className="text-xs gap-1.5">
            <GitPullRequest className="h-3.5 w-3.5" />
            GitHub
          </TabsTrigger>
          <TabsTrigger value="vercel" className="text-xs gap-1.5">
            <Rocket className="h-3.5 w-3.5" />
            Vercel
          </TabsTrigger>
          <TabsTrigger value="query" className="text-xs gap-1.5">
            <Database className="h-3.5 w-3.5" />
            Query Runner
          </TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-36 rounded-lg bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : integrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <Terminal className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">No projects configured</p>
                <p className="text-xs text-muted-foreground">
                  Add your first project in Settings to see its status here.
                </p>
              </div>
              <Button size="sm" onClick={() => navigate("/apps/onecommand/settings")}>
                Add Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {integrations.map((integration) => (
                <ProjectStatusCard key={integration.id} integration={integration} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* GitHub */}
        <TabsContent value="github">
          <GitHubPanel />
        </TabsContent>

        {/* Vercel */}
        <TabsContent value="vercel">
          <VercelPanel />
        </TabsContent>

        {/* Query Runner */}
        <TabsContent value="query" className="flex flex-col" style={{ minHeight: "calc(100vh - 220px)" }}>
          <QueryRunner initialSql={initialSql} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
