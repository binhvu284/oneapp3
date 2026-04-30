import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { FeatureCard } from "@/components/dashboard/FeatureCard";
import { ApiKeyDialog } from "@/components/ai/ApiKeyDialog";
import { useAIModelConnection } from "@/hooks/useAIModelConnection";
import { AI_AGENTS, AI_MODELS, getProviderById } from "@/config/aiProviders";
import { MessageSquare, Maximize2, Globe, Search, Plus, Key, MoreVertical, Link } from "lucide-react";
import type { AIProviderId } from "@/types/ai";

const aiFunctions = [{
  icon: <MessageSquare className="w-6 h-6 text-primary" />,
  iconBgColor: "bg-primary/20",
  title: "AI Chat",
  description: "Have conversations with AI assistants. Select an agent and start chatting.",
  path: "/developing/ai/chat"
}, {
  icon: <Maximize2 className="w-6 h-6 text-primary" />,
  iconBgColor: "bg-primary/20",
  title: "AI Popup",
  description: "Quick AI interactions in a popup window for fast responses.",
  path: "/developing/ai/popup"
}, {
  icon: <Globe className="w-6 h-6 text-primary" />,
  iconBgColor: "bg-primary/20",
  title: "AI Translate",
  description: "Translate text between multiple languages using AI agents.",
  path: "/developing/ai/translate"
}];

export default function OneAppAI() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [apiDialogOpen, setApiDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIProviderId | null>(null);
  const { connections, connectModel, disconnectModel, isConnected, toggleEnabled, isEnabled, githubActiveModel } = useAIModelConnection();

  const filteredFunctions = aiFunctions.filter(fn => fn.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleManageApi = (modelId: AIProviderId) => {
    setSelectedModel(modelId);
    setApiDialogOpen(true);
  };

  const getModelDisplayName = (id: AIProviderId | null) => {
    if (!id) return "";
    return getProviderById(id)?.name ?? id;
  };

  const renderProviderCard = (provider: typeof AI_AGENTS[number]) => {
    const connected = connections[provider.id as keyof typeof connections] ?? false;
    const activeModel = provider.id === "github" && connected
      ? (githubActiveModel || provider.defaultModel)
      : provider.defaultModel;

    return (
      <div key={provider.id} className="setting-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              {provider.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{provider.name}</span>
                <Badge
                  variant="outline"
                  className={connected
                    ? "text-success border-success/50"
                    : "text-destructive border-destructive/50"
                  }
                >
                  {connected ? "Connected" : "Not Connected"}
                </Badge>
              </div>
              {connected && (
                <div className="flex flex-col gap-2 mt-2">
                  <Badge variant="outline" className="text-xs font-normal text-muted-foreground border-border w-fit">
                    {activeModel}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={connected ? "ghost" : "default"}
              size="sm"
              className="gap-2"
              onClick={() => handleManageApi(provider.id)}
            >
              {connected ? (
                <><Key className="w-4 h-4" />Manage</>
              ) : (
                <><Link className="w-4 h-4" />Connect</>
              )}
            </Button>
            <Switch
              disabled={!connected}
              checked={connected && isEnabled(provider.id)}
              onCheckedChange={(checked) => toggleEnabled(provider.id, checked)}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <Tabs defaultValue="functions" className="w-full">
        <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start h-auto p-0 mb-6">
          <TabsTrigger value="functions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-4 py-3">
            AI Functions
          </TabsTrigger>
          <TabsTrigger value="agents" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-4 py-3">
            AI Agents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="functions" className="mt-0">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search AI functions..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 bg-card border-border" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFunctions.map(fn => <FeatureCard key={fn.title} icon={fn.icon} iconBgColor={fn.iconBgColor} title={fn.title} description={fn.description} onClick={() => navigate(fn.path)} />)}
          </div>
        </TabsContent>

        <TabsContent value="agents" className="mt-0 space-y-8">
          {/* AI Agents (GitHub, Groq, Exa) */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">AI Agents</h2>
            <div className="space-y-3">
              {AI_AGENTS.map(renderProviderCard)}
            </div>
          </div>

          {/* AI Models */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">AI Models</h2>
            <div className="space-y-3">
              {AI_MODELS.map((provider) => {
                const connected = connections[provider.id as keyof typeof connections] ?? false;
                return (
                  <div key={provider.id} className="setting-card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                          {provider.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{provider.name}</span>
                            <Badge
                              variant="outline"
                              className={connected ? "text-success border-success/50" : "text-destructive border-destructive/50"}
                            >
                              {connected ? "Connected" : "Not Connected"}
                            </Badge>
                          </div>
                          {connected && (
                            <Badge variant="outline" className="text-xs font-normal text-muted-foreground border-border w-fit mt-2">
                              {provider.defaultModel}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" className="gap-2" onClick={() => handleManageApi(provider.id)}>
                          <Key className="w-4 h-4" />
                          Manage API
                        </Button>
                        <Switch
                          disabled={!connected}
                          checked={connected && isEnabled(provider.id)}
                          onCheckedChange={(checked) => toggleEnabled(provider.id, checked)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Agents */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Custom Agents</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Create custom AI agents with personalized settings, memory, and knowledge files.
                </p>
              </div>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Agent
              </Button>
            </div>
            <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-border rounded-lg bg-muted/20">
              <p className="text-sm text-muted-foreground">No custom agents yet. Create your first agent to get started.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {selectedModel && (
        <ApiKeyDialog
          open={apiDialogOpen}
          onOpenChange={setApiDialogOpen}
          modelName={getModelDisplayName(selectedModel)}
          isConnected={isConnected(selectedModel)}
          onConnect={async (apiKey) => {
            return await connectModel(selectedModel, apiKey);
          }}
          onDisconnect={async () => {
            await disconnectModel(selectedModel);
          }}
        />
      )}
    </div>
  );
}
