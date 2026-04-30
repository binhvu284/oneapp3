import { useState, useEffect } from "react";
import { Eye, EyeOff, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SetupConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialUrl?: string;
  initialKey?: string;
  initialServiceKey?: string;
  onSave: (url: string, anonKey: string, serviceKey?: string) => Promise<boolean>;
  onTest?: () => Promise<any>;
  isSaving?: boolean;
  isTesting?: boolean;
}

export function SetupConnectionDialog({
  open,
  onOpenChange,
  initialUrl = "",
  initialKey = "",
  initialServiceKey = "",
  onSave,
  onTest,
  isSaving = false,
  isTesting = false,
}: SetupConnectionDialogProps) {
  const [url, setUrl] = useState(initialUrl);
  const [anonKey, setAnonKey] = useState(initialKey);
  const [serviceKey, setServiceKey] = useState(initialServiceKey);
  const [showAnonKey, setShowAnonKey] = useState(false);
  const [showServiceKey, setShowServiceKey] = useState(false);
  const [errors, setErrors] = useState<{ url?: string; anonKey?: string; serviceKey?: string }>({});

  useEffect(() => {
    if (open) {
      const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "";
      const envAnonKey = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY || "";

      setUrl(initialUrl || envUrl);
      setAnonKey(initialKey || envAnonKey);
      setServiceKey(initialServiceKey || envAnonKey); // Use anon as fallback if no service key
      setErrors({});
    }
  }, [open, initialUrl, initialKey, initialServiceKey]);

  const validateInputs = (): boolean => {
    const newErrors: { url?: string; anonKey?: string; serviceKey?: string } = {};

    if (!url.trim()) {
      newErrors.url = "URL is required";
    } else if (!/^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/.test(url.trim())) {
      newErrors.url = "Invalid format. Expected: https://[project-id].supabase.co";
    }

    if (!anonKey.trim()) {
      newErrors.anonKey = "Anon key is required";
    } else if (!/^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(anonKey.trim())) {
      newErrors.anonKey = "Invalid format. Must be a valid JWT token";
    }

    // Service key is optional but if provided, must be valid JWT
    if (serviceKey.trim() && !/^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(serviceKey.trim())) {
      newErrors.serviceKey = "Invalid format. Must be a valid JWT token";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAndTest = async () => {
    if (!validateInputs()) return;

    const saved = await onSave(url.trim(), anonKey.trim(), serviceKey.trim() || undefined);
    if (saved && onTest) {
      await onTest();
    }
    if (saved) {
      onOpenChange(false);
    }
  };

  const isLoading = isSaving || isTesting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Setup Supabase Connection</DialogTitle>
          <DialogDescription>
            Connect to your own Supabase project to sync data externally.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="supabase-url">Supabase Project URL</Label>
            <Input
              id="supabase-url"
              placeholder="https://xxxxx.supabase.co"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (errors.url) setErrors(prev => ({ ...prev, url: undefined }));
              }}
              className={errors.url ? "border-destructive" : ""}
            />
            {errors.url && (
              <p className="text-xs text-destructive">{errors.url}</p>
            )}
          </div>

          {/* Anon Key Input */}
          <div className="space-y-2">
            <Label htmlFor="anon-key">Anon Key (Public)</Label>
            <div className="relative">
              <Input
                id="anon-key"
                type={showAnonKey ? "text" : "password"}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => {
                  setAnonKey(e.target.value);
                  if (errors.anonKey) setErrors(prev => ({ ...prev, anonKey: undefined }));
                }}
                className={`pr-10 ${errors.anonKey ? "border-destructive" : ""}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowAnonKey(!showAnonKey)}
              >
                {showAnonKey ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.anonKey && (
              <p className="text-xs text-destructive">{errors.anonKey}</p>
            )}
          </div>

          {/* Service Role Key Input */}
          <div className="space-y-2">
            <Label htmlFor="service-key">
              Service Role Key (Secret)
              <span className="text-muted-foreground text-xs ml-2">- Optional for RLS bypass</span>
            </Label>
            <div className="relative">
              <Input
                id="service-key"
                type={showServiceKey ? "text" : "password"}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={serviceKey}
                onChange={(e) => {
                  setServiceKey(e.target.value);
                  if (errors.serviceKey) setErrors(prev => ({ ...prev, serviceKey: undefined }));
                }}
                className={`pr-10 ${errors.serviceKey ? "border-destructive" : ""}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowServiceKey(!showServiceKey)}
              >
                {showServiceKey ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.serviceKey && (
              <p className="text-xs text-destructive">{errors.serviceKey}</p>
            )}
            <p className="text-xs text-muted-foreground">
              ⚠️ Keep this key secure. It bypasses RLS policies.
            </p>
          </div>

          {/* Instructions */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">Before connecting:</p>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Create a Supabase project at supabase.com</li>
              <li>Copy SQL schema from Schema section below</li>
              <li>Run SQL in Supabase SQL Editor</li>
              <li>Get URL & anon key from Settings → API</li>
            </ol>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
            >
              Open Supabase Dashboard
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSaveAndTest} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isTesting ? "Testing..." : isSaving ? "Saving..." : "Save & Test Connection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
