import { useState } from "react";
import { ArrowLeft, Plus, Trash2, Save, Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FF_ONECOMMAND } from "@/lib/feature-flags";
import { Navigate } from "react-router-dom";
import { useOneCommandIntegrations, type OneCommandIntegration } from "@/hooks/useOneCommandIntegrations";
import { useOneCommandTokens } from "@/hooks/useOneCommandTokens";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function MaskedInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-9 font-mono text-xs"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

function AddProjectForm({ onAdd }: { onAdd: () => void }) {
  const { addIntegration, isMutating } = useOneCommandIntegrations();
  const [form, setForm] = useState({
    project_name: "",
    type: "both" as OneCommandIntegration["type"],
    github_repo: "",
    vercel_project_id: "",
  });

  async function handleAdd() {
    if (!form.project_name.trim()) {
      toast.error("Project name is required");
      return;
    }
    try {
      await addIntegration({
        project_name: form.project_name.trim(),
        type: form.type,
        github_repo: form.github_repo.trim() || null,
        vercel_project_id: form.vercel_project_id.trim() || null,
      });
      toast.success("Project added");
      setForm({ project_name: "", type: "both", github_repo: "", vercel_project_id: "" });
      onAdd();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add project");
    }
  }

  return (
    <Card className="border-dashed">
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Project name *</Label>
            <Input
              value={form.project_name}
              onChange={(e) => setForm((f) => ({ ...f, project_name: e.target.value }))}
              placeholder="My App"
              className="h-8 text-xs"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as OneCommandIntegration["type"] }))}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both" className="text-xs">GitHub + Vercel</SelectItem>
                <SelectItem value="github" className="text-xs">GitHub only</SelectItem>
                <SelectItem value="vercel" className="text-xs">Vercel only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(form.type === "github" || form.type === "both") && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">GitHub repo (owner/repo)</Label>
              <Input
                value={form.github_repo}
                onChange={(e) => setForm((f) => ({ ...f, github_repo: e.target.value }))}
                placeholder="binhvu284/oneapp3"
                className="h-8 text-xs font-mono"
              />
            </div>
          )}
          {(form.type === "vercel" || form.type === "both") && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Vercel project ID</Label>
              <Input
                value={form.vercel_project_id}
                onChange={(e) => setForm((f) => ({ ...f, vercel_project_id: e.target.value }))}
                placeholder="prj_..."
                className="h-8 text-xs font-mono"
              />
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <Button size="sm" onClick={handleAdd} disabled={isMutating} className="gap-1.5 text-xs">
            {isMutating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
            Add Project
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OneCommandSettings() {
  const navigate = useNavigate();
  const { integrations, removeIntegration, isMutating } = useOneCommandIntegrations();
  const { githubPat, vercelToken, isLoading: tokensLoading, saveTokens, isSaving } = useOneCommandTokens();
  const [ghPat, setGhPat] = useState("");
  const [vcToken, setVcToken] = useState("");

  if (!FF_ONECOMMAND) return <Navigate to="/" replace />;

  async function handleSaveTokens() {
    try {
      await saveTokens(
        ghPat || undefined,
        vcToken || undefined,
      );
      toast.success("Tokens saved");
      setGhPat("");
      setVcToken("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate("/apps/onecommand")}
          className="gap-1.5 text-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-lg font-semibold text-foreground">OneCommand Settings</h1>
      </div>

      <div className="flex flex-col gap-8">
        {/* API Tokens */}
        <section>
          <h2 className="text-sm font-semibold text-foreground mb-4">API Tokens</h2>
          <Card>
            <CardContent className="p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">
                  GitHub Personal Access Token
                  {githubPat && (
                    <span className="ml-2 text-[10px] text-success font-normal">✓ saved</span>
                  )}
                </Label>
                <MaskedInput
                  value={ghPat}
                  onChange={setGhPat}
                  placeholder={githubPat ? "••••••••••••••• (saved — enter to replace)" : "ghp_..."}
                />
                <p className="text-[10px] text-muted-foreground">
                  Requires: repo, read:user, workflow (for PR/branch actions).
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">
                  Vercel API Token
                  {vercelToken && (
                    <span className="ml-2 text-[10px] text-success font-normal">✓ saved</span>
                  )}
                </Label>
                <MaskedInput
                  value={vcToken}
                  onChange={setVcToken}
                  placeholder={vercelToken ? "••••••••••••••• (saved — enter to replace)" : "Enter Vercel token"}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleSaveTokens}
                  disabled={isSaving || tokensLoading || (!ghPat && !vcToken)}
                  className="gap-1.5 text-xs"
                >
                  {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                  Save Tokens
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Projects */}
        <section>
          <h2 className="text-sm font-semibold text-foreground mb-4">Projects</h2>
          <div className="flex flex-col gap-3">
            {integrations.map((integration) => (
              <Card key={integration.id} className="border-border">
                <CardContent className="p-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{integration.project_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{integration.type}</p>
                    {integration.github_repo && (
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        {integration.github_repo}
                      </p>
                    )}
                    {integration.vercel_project_id && (
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {integration.vercel_project_id}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeIntegration(integration.id)}
                    disabled={isMutating}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            ))}

            <AddProjectForm onAdd={() => {}} />
          </div>
        </section>
      </div>
    </div>
  );
}
