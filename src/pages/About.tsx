import { useEffect, useRef, useState } from "react";
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
      className="hidden md:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px bg-white/10 overflow-hidden"
    >
      <div
        className="absolute top-0 left-0 right-0 bg-gradient-to-b from-cyan-400 to-cyan-600/0"
        style={{ height: reduceMotion ? "100%" : `${progress * 100}%` }}
      />
    </div>
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
        <RevealSection animation="blur" className="pt-8 sm:pt-16">
          <SectionHeading
            eyebrow="Journey"
            title={
              <>
                From a notebook to{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
                  an operating system
                </span>
                .
              </>
            }
            description="Three versions, six years, one founder. Scroll the timeline."
          />
        </RevealSection>

        <div className="relative max-w-5xl mx-auto mt-16 sm:mt-24">
          <TimelineSpine />
          <div className="space-y-16 sm:space-y-24">
            {journeyMilestones.map((m, i) => (
              <TimelineItem key={m.id} milestone={m} index={i} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
