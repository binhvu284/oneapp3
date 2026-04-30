import { Search, Filter, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { INTEGRATED_APPS } from "@/config/integratedApps";
import { IntegratedAppCard } from "./IntegratedAppCard";
import { useIntegratedApps } from "@/hooks/useIntegratedApps";

// ─── Props ────────────────────────────────────────────────────────────────────

interface IntegratedAppsTabProps {
    searchQuery: string;
    onSearchChange: (q: string) => void;
}

// ─── IntegratedAppsTab ────────────────────────────────────────────────────────

export function IntegratedAppsTab({ searchQuery, onSearchChange }: IntegratedAppsTabProps) {
    const { connections, connectApp, updateConnection, disconnectApp } = useIntegratedApps();

    const filteredApps = INTEGRATED_APPS.filter(
        (app) =>
            app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            {/* Search & Filter Bar */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search apps..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} className="pl-9" />
                </div>
                <Button variant="outline" size="icon">
                    <Filter className="w-4 h-4" />
                </Button>
            </div>

            <Card className="border-border">
                <CardHeader>
                    <CardTitle className="text-lg">Integrated Apps</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Apps integrated via API. Manage API credentials and test connections.
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {filteredApps.length > 0 ? (
                        filteredApps.map((app) => (
                            <IntegratedAppCard
                                key={app.id}
                                app={app}
                                connection={connections.find(c => c.appId === app.id)}
                                onConnect={connectApp}
                                onUpdate={updateConnection}
                                onDisconnect={disconnectApp}
                            />
                        ))
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">No integrated apps found.</div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}

// ─── OpenSourceTab ────────────────────────────────────────────────────────────

export function OpenSourceTab() {
    return (
        <Card className="border-border">
            <CardHeader>
                <CardTitle className="text-lg">Open Source Apps</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Deploy and run open source applications on OneApp. This feature is coming soon.
                </p>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                        <GitBranch className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Coming Soon</h3>
                    <p className="text-muted-foreground max-w-md">
                        Deploy source code directly and run applications on OneApp platform.
                        Connect your repositories and manage deployments all in one place.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
