import { useState, useEffect } from "react";
import { toast } from "sonner";

export type AppConnectionStatus = "disconnected" | "connected";

export interface AppConnection {
    appId: string;
    status: AppConnectionStatus;
    credentials: Record<string, string>;
}

export function useIntegratedApps() {
    const [connections, setConnections] = useState<AppConnection[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem("oneapp_integrated_apps");
        if (saved) {
            try {
                setConnections(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse integrated apps", e);
            }
        }
        setIsLoading(false);
    }, []);

    const saveConnections = (newDocs: AppConnection[]) => {
        setConnections(newDocs);
        localStorage.setItem("oneapp_integrated_apps", JSON.stringify(newDocs));
    };

    const connectApp = async (appId: string, credentials: Record<string, string>) => {
        // Mock API testing process
        await new Promise(resolve => setTimeout(resolve, 1500));

        // For testing purposes, let's say apiKey length < 5 is an error
        if (credentials.apiKey && credentials.apiKey.length < 5) {
            toast.error("Invalid API Key");
            throw new Error("Invalid API Key");
        }

        const newConns = [...connections.filter(c => c.appId !== appId), {
            appId,
            status: "connected" as AppConnectionStatus,
            credentials
        }];
        saveConnections(newConns);
        toast.success("Successfully connected to " + appId);
        return true;
    };

    const updateConnection = async (appId: string, credentials: Record<string, string>) => {
        // Mock API testing
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (credentials.apiKey && credentials.apiKey.length < 5) {
            toast.error("Invalid API Key");
            throw new Error("Invalid API Key");
        }

        const newConns = connections.map(c =>
            c.appId === appId ? { ...c, credentials } : c
        );
        saveConnections(newConns);
        toast.success("Successfully updated connection for " + appId);
        return true;
    };

    const disconnectApp = (appId: string) => {
        const newConns = connections.filter(c => c.appId !== appId);
        saveConnections(newConns);
        toast.success("Disconnected " + appId);
    };

    const getConnection = (appId: string) => connections.find(c => c.appId === appId);

    return {
        connections,
        isLoading,
        connectApp,
        updateConnection,
        disconnectApp,
        getConnection
    };
}
