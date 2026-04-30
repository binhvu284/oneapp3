import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Global Error Boundary — catches unhandled render errors anywhere in the tree.
 * Prevents a single crashed component from taking down the entire app.
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error("[ErrorBoundary] Uncaught error:", error, info.componentStack);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-6">
                    <div className="max-w-md w-full text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-destructive" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-xl font-bold text-foreground">Something went wrong</h1>
                            <p className="text-muted-foreground text-sm">
                                An unexpected error occurred. You can try reloading the page or going back to the previous screen.
                            </p>
                            {this.state.error && (
                                <details className="mt-3 text-left">
                                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                                        Error details
                                    </summary>
                                    <pre className="mt-2 p-3 rounded-lg bg-muted text-xs text-muted-foreground overflow-auto max-h-32 whitespace-pre-wrap break-all">
                                        {this.state.error.message}
                                    </pre>
                                </details>
                            )}
                        </div>
                        <div className="flex gap-3 justify-center">
                            <Button variant="outline" onClick={this.handleReset} className="gap-2">
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                            </Button>
                            <Button onClick={() => window.location.href = "/"}>
                                Go to Home
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
