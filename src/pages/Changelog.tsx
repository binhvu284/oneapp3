import { useEffect, useRef, useState } from "react";
import { SectionHeading } from "@/components/website/SectionHeading";
import { ChangelogEntry } from "@/components/website/ChangelogEntry";
import { RevealSection } from "@/components/explore/RevealSection";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { changelog, countShippedFeatures } from "@/data/changelog";

function HeroCounter({ target, label }: { target: number; label: string }) {
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    if (reduceMotion) {
      setValue(target);
      return;
    }
    const duration = 1200;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reduceMotion]);

  return (
    <div className="flex flex-col items-center">
      <span className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent tabular-nums">
        {value}
      </span>
      <span className="mt-2 text-[11px] uppercase tracking-[0.2em] text-gray-500">{label}</span>
    </div>
  );
}

export default function Changelog() {
  useDocumentMeta({
    title: "Changelog",
    description: "Every release of OneApp — from v1's notebook to OneApp 3's founder OS.",
    canonicalPath: "/changelog",
  });

  const totalFeatures = countShippedFeatures();

  return (
    <div className="px-4 sm:px-6 pb-20">
      <RevealSection animation="blur" className="pt-12 sm:pt-20">
        <SectionHeading
          eyebrow="Changelog"
          title={
            <>
              Every release,{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
                in order
              </span>
              .
            </>
          }
          description="OneApp ships small and often. Skim the highlights or jump to the latest version."
        />
      </RevealSection>

      <div className="max-w-3xl mx-auto mt-10 sm:mt-14 flex items-center justify-center gap-12 sm:gap-20">
        <HeroCounter target={changelog.length} label="Versions" />
        <div className="w-px h-14 bg-white/10" />
        <HeroCounter target={totalFeatures} label="Notes shipped" />
      </div>

      <div className="max-w-3xl mx-auto mt-16 space-y-6">
        {changelog.map((entry, i) => (
          <RevealSection key={entry.version} animation="up" delay={i * 80}>
            <ChangelogEntry entry={entry} />
          </RevealSection>
        ))}
      </div>
    </div>
  );
}
