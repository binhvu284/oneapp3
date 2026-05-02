import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import type { JourneyMilestone } from "@/data/journeyMilestones";

interface TimelineItemProps {
  milestone: JourneyMilestone;
  index: number;
}

export function TimelineItem({ milestone, index }: TimelineItemProps) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });
  const reduceMotion = useReducedMotion();
  const reveal = reduceMotion || isVisible;
  const alignRight = index % 2 === 1;

  return (
    <div
      ref={ref}
      className={cn(
        "relative grid md:grid-cols-2 gap-6 items-start",
        !reduceMotion && "transition-all duration-700 ease-out",
        !reduceMotion && (reveal ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")
      )}
    >
      {/* node on the center line */}
      <div
        aria-hidden
        className="hidden md:block absolute left-1/2 -translate-x-1/2 top-1 w-3 h-3 rounded-full bg-indigo-400 shadow-[0_0_18px_rgba(99,102,241,0.65)] ring-4 ring-[#030712]"
      />

      {/* spacer / content based on side */}
      {alignRight ? <div className="hidden md:block" /> : null}

      <div
        className={cn(
          "rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6 sm:p-7",
          alignRight ? "md:text-left md:pl-10" : "md:text-right md:pr-10"
        )}
      >
        <div
          className={cn(
            "flex items-baseline gap-3 mb-2",
            alignRight ? "" : "md:justify-end"
          )}
        >
          <span className="font-mono text-sm text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 rounded-md px-2 py-0.5">
            {milestone.version}
          </span>
          <span className="text-xs text-gray-500">{milestone.date}</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-semibold tracking-tight mb-2">
          {milestone.headline}
        </h3>
        <p className="text-sm text-gray-400 leading-relaxed mb-4">{milestone.summary}</p>
        <ul className="space-y-1.5 text-sm text-gray-300">
          {milestone.features.map((f) => (
            <li
              key={f}
              className={cn(
                "flex gap-2 items-start",
                alignRight ? "" : "md:flex-row-reverse md:text-right"
              )}
            >
              <span className="w-1 h-1 rounded-full bg-indigo-400 mt-2 shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {!alignRight ? <div className="hidden md:block" /> : null}
    </div>
  );
}
