import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ExternalLink, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelName: string;
  onConnect: (apiKey: string) => Promise<{ modelVersion?: string } | void>;
  onDisconnect: () => Promise<void>;
  isConnected: boolean;
}

export function ApiKeyDialog({
  open,
  onOpenChange,
  modelName,
  onConnect,
  onDisconnect,
  isConnected,
}: ApiKeyDialogProps) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    setIsConnecting(true);
    setValidationError(null);

    try {
      const result = await onConnect(apiKey.trim());

      const modelVersion = result && typeof result === 'object' && 'modelVersion' in result ? result.modelVersion : undefined;

      toast.success(`Successfully connected to ${modelName}`, {
        description: modelVersion ? `Using ${modelVersion}` : undefined
      });
      setApiKey("");
      setValidationError(null);
      onOpenChange(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to validate API key";
      setValidationError(errorMessage);
      toast.error("Connection failed", { description: errorMessage });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await onDisconnect();
      toast.success(`Disconnected from ${modelName}`);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to disconnect");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setApiKey("");
      setValidationError(null);
    }
    onOpenChange(open);
  };

  const getApiKeyUrl = () => {
    if (modelName === "Gemini") return "https://aistudio.google.com/app/apikey";
    if (modelName === "ChatGPT") return "https://platform.openai.com/api-keys";
    if (modelName === "Claude") return "https://console.anthropic.com/settings/keys";
    if (modelName === "Perplexity") return "https://www.perplexity.ai/settings/api";
    if (modelName === "Grok") return "https://console.x.ai/";
    if (modelName === "DeepSeek") return "https://platform.deepseek.com/api_keys";
    if (modelName === "Groq Cloud") return "https://console.groq.com/keys";
    if (modelName === "Exa Search") return "https://dashboard.exa.ai/api-keys";
    if (modelName === "GitHub Models") return "https://github.com/marketplace/models";
    return "#";
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage {modelName} API</DialogTitle>
          <DialogDescription>
            {isConnected
              ? `Your ${modelName} API key is connected and validated. You can disconnect or update it.`
              : `Enter your ${modelName} API key to enable AI features. The key will be validated and securely stored.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isConnected && (
            <>
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showKey ? "text" : "password"}
                    placeholder="Enter your API key..."
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      setValidationError(null);
                    }}
                    className={`pr-10 ${validationError ? "border-destructive" : ""}`}
                    disabled={isConnecting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowKey(!showKey)}
                    disabled={isConnecting}
                  >
                    {showKey ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {validationError && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <span className="text-sm text-destructive">{validationError}</span>
                </div>
              )}

              <a
                href={getApiKeyUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Get your {modelName} API key
                <ExternalLink className="h-3 w-3" />
              </a>
            </>
          )}

          {isConnected && (
            <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg border border-success/20">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="text-sm text-success">Connected & Securely Stored</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {isConnected ? (
            <>
              <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isDisconnecting}>
                Close
              </Button>
              <Button variant="destructive" onClick={handleDisconnect} disabled={isDisconnecting}>
                {isDisconnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  "Disconnect"
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isConnecting}>
                Cancel
              </Button>
              <Button onClick={handleConnect} disabled={isConnecting || !apiKey.trim()}>
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  "Connect"
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
