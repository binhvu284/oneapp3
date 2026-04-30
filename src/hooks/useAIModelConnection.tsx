import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource as useAuth } from "@/hooks/useAuthSource";

const ENABLED_STORAGE_KEY = "oneapp_ai_models_enabled";

interface ModelConnection {
  github: boolean;
  gemini: boolean;
  chatgpt: boolean;
  claude: boolean;
  perplexity: boolean;
  grok: boolean;
  deepseek: boolean;
  groq: boolean;
  exa: boolean;
}

interface ModelEnabled {
  github: boolean;
  gemini: boolean;
  chatgpt: boolean;
  claude: boolean;
  perplexity: boolean;
  grok: boolean;
  deepseek: boolean;
  groq: boolean;
  exa: boolean;
}

const DEFAULT_CONNECTIONS: ModelConnection = {
  github: false, gemini: false, chatgpt: false, claude: false, perplexity: false,
  grok: false, deepseek: false, groq: false, exa: false
};

export function useAIModelConnection() {
  const { user, oneappToken } = useAuth();
  // Track if we have pending optimistic updates to prevent overwriting
  const pendingOptimisticRef = useRef<Set<string>>(new Set());

  const [connections, setConnections] = useState<ModelConnection>(DEFAULT_CONNECTIONS);
  const [githubActiveModel, setGithubActiveModel] = useState<string>("gpt-4o");

  const [enabled, setEnabled] = useState<ModelEnabled>(() => {
    const stored = localStorage.getItem(ENABLED_STORAGE_KEY);
    const defaultState: ModelEnabled = {
      github: false, gemini: false, chatgpt: false, claude: false, perplexity: false,
      grok: false, deepseek: false, groq: false, exa: false,
    };
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.lovableAI !== undefined) delete parsed.lovableAI;
        return { ...defaultState, ...parsed };
      } catch {
        return defaultState;
      }
    }
    return defaultState;
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load connection status via edge function — uses OneApp JWT + service_role to bypass RLS
  const loadConnections = useCallback(async () => {
    if (!user || !oneappToken) {
      setConnections(DEFAULT_CONNECTIONS);
      setIsLoading(false);
      return;
    }

    try {
      const response = await supabase.functions.invoke("get-api-keys", {
        headers: {
          Authorization: `Bearer ${oneappToken}`,
        },
      });

      if (response.error) {
        console.error("Error loading API keys via edge function:", response.error);
        setIsLoading(false);
        return;
      }

      if (response.data?.connections) {
        const serverConnections = response.data.connections as ModelConnection;
        if (response.data.github_active_model) {
          setGithubActiveModel(response.data.github_active_model);
        }
        // Merge: keep optimistic=true if server hasn't confirmed yet
        setConnections(prev => {
          const merged: ModelConnection = { ...serverConnections };
          // For any model in pendingOptimistic, keep it as true
          for (const model of pendingOptimisticRef.current) {
            (merged as unknown as Record<string, boolean>)[model] = true;
          }
          return merged;
        });
      }
    } catch (error) {
      console.error("Failed to load connections:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, oneappToken]);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  useEffect(() => {
    localStorage.setItem(ENABLED_STORAGE_KEY, JSON.stringify(enabled));
  }, [enabled]);

  const connectModel = async (model: keyof ModelConnection, apiKey: string) => {
    if (!oneappToken) {
      throw new Error("Please sign in to connect API keys");
    }

    // Mark this model as pending optimistic update
    pendingOptimisticRef.current.add(model);

    // Optimistically update connection state FIRST
    setConnections(prev => ({ ...prev, [model]: true }));

    try {
      // Validate and store key via edge function with OneApp JWT
      const response = await supabase.functions.invoke("validate-api-key", {
        body: { provider: model, apiKey },
        headers: {
          Authorization: `Bearer ${oneappToken}`,
        },
      });

      if (response.error) {
        // Rollback optimistic update on failure
        pendingOptimisticRef.current.delete(model);
        setConnections(prev => ({ ...prev, [model]: false }));
        throw new Error(response.error.message);
      }

      if (!response.data?.valid) {
        // Rollback on failure
        pendingOptimisticRef.current.delete(model);
        setConnections(prev => ({ ...prev, [model]: false }));
        throw new Error(response.data?.error || "Invalid API key");
      }

      // Success! Connection is confirmed. Clear pending flag - optimistic stays.
      pendingOptimisticRef.current.delete(model);

      // Do background refresh to sync with server (non-blocking)
      setTimeout(() => loadConnections(), 1000);

      return response.data;
    } catch (error) {
      // Ensure cleanup on unexpected error
      pendingOptimisticRef.current.delete(model);
      throw error;
    }
  };

  const disconnectModel = async (model: keyof ModelConnection) => {
    if (!oneappToken) return;

    // Optimistically update local state immediately
    setConnections(prev => ({ ...prev, [model]: false }));
    setEnabled(prev => ({ ...prev, [model]: false }));

    try {
      const response = await supabase.functions.invoke("disconnect-api-key", {
        body: { provider: model },
        headers: {
          Authorization: `Bearer ${oneappToken}`,
        },
      });

      if (response.error) {
        // Rollback on failure
        setConnections(prev => ({ ...prev, [model]: true }));
        throw new Error(response.error.message);
      }
    } catch (error) {
      console.error("Failed to disconnect model:", error);
      throw error;
    }
  };

  const isConnected = (model: keyof ModelConnection) => connections[model];

  const toggleEnabled = (model: keyof ModelEnabled, value: boolean) => {
    setEnabled(prev => ({ ...prev, [model]: value }));
  };

  const isEnabled = (model: keyof ModelEnabled) => enabled[model];

  return {
    connections,
    enabled,
    isLoading,
    connectModel,
    disconnectModel,
    isConnected,
    toggleEnabled,
    isEnabled,
    githubActiveModel,
    setGithubActiveModel,
    refreshConnections: loadConnections,
  };
}
