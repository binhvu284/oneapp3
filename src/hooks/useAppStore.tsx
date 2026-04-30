import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource } from "./useAuthSource";

export interface AppModule {
    id: string;
    name: string;
    description: string;
    iconName: string;
    url: string;
    author: string;
    version: string;
}

export const STORE_MODULES: AppModule[] = [
    {
        id: "app_crypto",
        name: "OneCrypto",
        description: "Real-time cryptocurrency portfolio tracker and market overview.",
        iconName: "Bitcoin",
        url: "/apps/crypto",
        author: "OneApp Core",
        version: "1.2.0"
    },
    {
        id: "app_onenote",
        name: "OneNote",
        description: "Advanced markdown-based note-taking application.",
        iconName: "StickyNote",
        url: "/apps/onenote",
        author: "OneApp Core",
        version: "2.0.1"
    },
    {
        id: "app_ai",
        name: "OneApp AI",
        description: "Intelligent AI assistant with multiple integrated models.",
        iconName: "Sparkles",
        url: "/developing/ai",
        author: "OneApp Labs",
        version: "2.1.0"
    }
];

const APP_STORE_KEY = "oneapp-installed-apps";
// By default, AI is installed
const DEFAULT_INSTALLED = ["app_ai"];

export function useAppStore() {
    const { user, isLoading: authLoading } = useAuthSource();
    const [installedApps, setInstalledApps] = useState<string[]>(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem(APP_STORE_KEY);
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch {
                    return DEFAULT_INSTALLED;
                }
            }
        }
        return DEFAULT_INSTALLED;
    });

    const [isStoreLoading, setIsStoreLoading] = useState(true);

    // Sync with Supabase (if we want to persist across devices later)
    // For now, using LocalStorage for blazing fast access as requested in Phase 2
    useEffect(() => {
        if (!authLoading) {
            setIsStoreLoading(false);
        }
    }, [authLoading]);

    const toggleApp = useCallback((appId: string) => {
        setInstalledApps(prev => {
            const isInstalled = prev.includes(appId);
            let next;
            if (isInstalled) {
                next = prev.filter(id => id !== appId);
                toast.info("App uninstalled");
            } else {
                next = [...prev, appId];
                toast.success("App installed successfully");
            }
            localStorage.setItem(APP_STORE_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    const isInstalled = useCallback((url: string) => {
        // Core routes that are always 'installed' or bypass the store
        if (!url.startsWith("/apps/") && !url.startsWith("/developing/ai")) return true;

        const module = STORE_MODULES.find(m => m.url === url);
        if (!module) return true; // If it's not a store module, consider it installed natively

        return installedApps.includes(module.id);
    }, [installedApps]);

    return {
        installedApps,
        toggleApp,
        isInstalled,
        isStoreLoading
    };
}
