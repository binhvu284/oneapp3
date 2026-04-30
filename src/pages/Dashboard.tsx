import { DashboardGrid } from "@/components/dashboard/DashboardGrid";

export default function Dashboard() {
  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your personalized workspace.</p>
      </div>

      <div className="w-full">
        <DashboardGrid />
      </div>
    </div>
  );
}
