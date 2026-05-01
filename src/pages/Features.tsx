import { ParticleBackground } from "@/components/landing/ParticleBackground";
import { RevealSection } from "@/components/explore/RevealSection";
import { SectionHeading } from "@/components/website/SectionHeading";
import { ModuleCard } from "@/components/website/ModuleCard";
import { ecosystemModules } from "@/data/ecosystemModules";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export default function Features() {
  useDocumentMeta({
    title: "Ecosystem",
    description:
      "OneApp ecosystem — five focused modules that share a single workspace, theme, and data layer.",
    canonicalPath: "/ecosystem",
  });

  return (
    <>
      <ParticleBackground />
      <div className="relative px-4 sm:px-6 pb-20">
        <RevealSection animation="blur" className="pt-8 sm:pt-16">
          <SectionHeading
            eyebrow="Ecosystem"
            title={
              <>
                Five modules.{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
                  One workspace.
                </span>
              </>
            }
            description="Every OneApp module shares the same auth, theme, dashboard, and data layer. Hover a card to feel the accent it brings to the system."
          />
        </RevealSection>

        <div className="max-w-6xl mx-auto mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ecosystemModules.map((mod, i) => (
            <RevealSection key={mod.id} animation="up" delay={i * 100}>
              <ModuleCard module={mod} />
            </RevealSection>
          ))}
        </div>
      </div>
    </>
  );
}
