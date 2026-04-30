import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center max-w-md w-full space-y-6 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <FileQuestion className="w-12 h-12 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tight text-foreground">404</h1>
          <p className="text-lg text-muted-foreground">We couldn't find the page you're looking for.</p>
        </div>
        <Button asChild size="lg" className="mt-4 shadow-md w-full sm:w-auto">
          <a href="/">
            <Home className="w-4 h-4 mr-2" />
            Return to Dashboard
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
