/**
 * PageLoader — Fallback UI hiển thị khi lazy-loaded page đang tải.
 * Dùng làm fallback cho React.Suspense trong App.tsx.
 */
export function PageLoader() {
    return (
        <div className="flex-1 flex items-center justify-center min-h-[50vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-10 h-10">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
                </div>
                <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
            </div>
        </div>
    );
}
