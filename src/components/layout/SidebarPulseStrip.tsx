import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSystemPulse, type PulseStatus } from "@/hooks/useSystemPulse";

interface SidebarPulseStripProps {
  collapsed: boolean;
}

const STATUS_TONE: Record<PulseStatus, string> = {
  ok: "bg-[hsl(var(--pulse-ok))]",
  warn: "bg-[hsl(var(--pulse-warn))]",
  bad: "bg-[hsl(var(--pulse-bad))]",
  idle: "bg-muted-foreground/40",
};

const STATUS_LABEL: Record<PulseStatus, string> = {
  ok: "online",
  warn: "degraded",
  bad: "offline",
  idle: "idle",
};

function PulseDot({ status, label }: { status: PulseStatus; label: string }) {
  const tone = STATUS_TONE[status];
  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative flex items-center justify-center w-2.5 h-2.5">
            <span
              className={cn(
                "absolute inset-0 rounded-full opacity-60",
                tone,
                status === "ok" && "pulse-ping",
              )}
            />
            <span
              className={cn(
                "relative w-2 h-2 rounded-full ring-1 ring-black/30",
                tone,
              )}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <span className="font-medium">{label}</span>{" "}
          <span className="text-muted-foreground">· {STATUS_LABEL[status]}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function SidebarPulseStrip({ collapsed }: SidebarPulseStripProps) {
  const pulse = useSystemPulse();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className={cn(
        "mx-3 mb-3 mt-2 rounded-xl px-3 py-2 neu-inset flex items-center gap-3",
        collapsed && "mx-2 px-2 flex-col gap-2 py-2",
      )}
    >
      <PulseDot status={pulse.db} label="Database" />
      <PulseDot status={pulse.deploy} label="Deploy" />
      <PulseDot status={pulse.ai} label="AI" />
      {!collapsed && (
        <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
          {pulse.dbLatency !== undefined ? `${pulse.dbLatency}ms` : "pulse"}
        </span>
      )}
    </motion.div>
  );
}
