import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ParticleBackground } from "@/components/landing/ParticleBackground";
import { RevealSection } from "@/components/explore/RevealSection";
import { SectionHeading } from "@/components/website/SectionHeading";
import { TimelineItem } from "@/components/website/TimelineItem";
import { journeyMilestones } from "@/data/journeyMilestones";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useReducedMotion } from "@/hooks/useReducedMotion";

function TimelineSpine() {
  const railRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const el = railRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const start = window.innerHeight * 0.6;
        const end = -rect.height + window.innerHeight * 0.4;
        const total = start - end;
        const traveled = start - rect.top;
        setProgress(Math.max(0, Math.min(1, traveled / total)));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduceMotion]);

  return (
    <div
      ref={railRef}
      aria-hidden
      className="hidden md:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px bg-white/8 overflow-visible"
    >
      {/* Animated fill */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          background: "linear-gradient(to bottom, #6366f1, #818cf8, rgba(99,102,241,0))",
          height: reduceMotion ? "100%" : `${progress * 100}%`,
          transition: "height 0.1s linear",
          boxShadow: "0 0 8px rgba(99,102,241,0.4)",
        }}
      />
      {/* Trailing glow dot */}
      {!reduceMotion && progress > 0 && progress < 1 && (
        <div
          className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.8)]"
          style={{ top: `calc(${progress * 100}% - 4px)` }}
        />
      )}
    </div>
  );
}

/* Floating decorative elements scattered around the timeline */
function FloatingDecorations() {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;

  const dots = [
    { x: "8%", y: "12%", size: 3, delay: 0, duration: 4 },
    { x: "92%", y: "18%", size: 2, delay: 0.5, duration: 5 },
    { x: "5%", y: "38%", size: 4, delay: 1, duration: 3.5 },
    { x: "95%", y: "45%", size: 2, delay: 1.5, duration: 4.5 },
    { x: "10%", y: "62%", size: 3, delay: 0.8, duration: 4 },
    { x: "88%", y: "70%", size: 4, delay: 0.3, duration: 5 },
    { x: "6%", y: "85%", size: 2, delay: 1.2, duration: 3.8 },
    { x: "93%", y: "90%", size: 3, delay: 0.7, duration: 4.2 },
  ];

  const lines = [
    { x: "15%", y: "25%", w: 40, angle: 30, delay: 0.2 },
    { x: "78%", y: "35%", w: 30, angle: -20, delay: 0.9 },
    { x: "12%", y: "55%", w: 50, angle: 15, delay: 0.4 },
    { x: "80%", y: "65%", w: 35, angle: -25, delay: 1.1 },
    { x: "18%", y: "78%", w: 28, angle: 20, delay: 0.6 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {/* Floating dots */}
      {dots.map((d, i) => (
        <motion.div
          key={`dot-${i}`}
          className="absolute rounded-full bg-indigo-400/30"
          style={{
            left: d.x,
            top: d.y,
            width: d.size,
            height: d.size,
          }}
          animate={{ y: [0, -8, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Decorative short lines */}
      {lines.map((l, i) => (
        <motion.div
          key={`line-${i}`}
          className="absolute"
          style={{
            left: l.x,
            top: l.y,
            width: l.w,
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)",
            transform: `rotate(${l.angle}deg)`,
            transformOrigin: "left center",
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: l.delay + 0.5, ease: "easeOut" }}
        />
      ))}

      {/* Large ambient glow on left */}
      <div
        className="absolute left-0 top-1/3 w-64 h-64 rounded-full opacity-5 pointer-events-none"
        style={{ background: "radial-gradient(circle, #6366f1, transparent)" }}
      />
      {/* Large ambient glow on right */}
      <div
        className="absolute right-0 top-2/3 w-48 h-48 rounded-full opacity-5 pointer-events-none"
        style={{ background: "radial-gradient(circle, #818cf8, transparent)" }}
      />
    </div>
  );
}

/* Counter that animates up when in view */
function StatCounter({ label, value }: { label: string; value: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center gap-1"
    >
      <span className="text-2xl sm:text-3xl font-bold text-gradient-brand">{value}</span>
      <span className="text-xs text-white/35 uppercase tracking-widest">{label}</span>
    </motion.div>
  );
}

export default function About() {
  useDocumentMeta({
    title: "Journey",
    description: "OneApp's path from a founder's notebook to a full operating system.",
    canonicalPath: "/journey",
  });

  return (
    <>
      <ParticleBackground />
      <div className="relative px-4 sm:px-6 pb-20">
        {/* Hero heading */}
        <RevealSection animation="blur" className="pt-8 sm:pt-16">
          <SectionHeading
            eyebrow="Journey"
            title={
              <>
                From a notebook to{" "}
                <span className="text-gradient-brand">
                  an operating system
                </span>
                .
              </>
            }
            description="Three versions, six years, one founder. Scroll the timeline."
          />
        </RevealSection>

        {/* Quick stats */}
        <RevealSection animation="up" className="mt-8 sm:mt-10">
          <div className="max-w-lg mx-auto grid grid-cols-3 gap-6 py-6 px-8 rounded-2xl border border-indigo-500/10 bg-indigo-500/[0.03]">
            <StatCounter value="3" label="Versions" />
            <StatCounter value="6yrs" label="Building" />
            <StatCounter value="1" label="Founder" />
          </div>
        </RevealSection>

        {/* Timeline */}
        <div className="relative max-w-5xl mx-auto mt-16 sm:mt-24">
          <FloatingDecorations />
          <TimelineSpine />
          <div className="space-y-16 sm:space-y-24">
            {journeyMilestones.map((m, i) => (
              <TimelineItem key={m.id} milestone={m} index={i} />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <RevealSection animation="up" className="mt-20 sm:mt-28 text-center">
          <p className="text-white/30 text-sm mb-4 tracking-wide">The journey continues.</p>
          <a
            href="/changelog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/10 transition-colors"
          >
            View full changelog →
          </a>
        </RevealSection>
      </div>
    </>
  );
}
