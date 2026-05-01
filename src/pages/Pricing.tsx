import { SectionHeading } from "@/components/website/SectionHeading";
import { PricingTierCard } from "@/components/website/PricingTierCard";
import { RevealSection } from "@/components/explore/RevealSection";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { pricingTiers, pricingFAQ } from "@/data/pricingTiers";

export default function Pricing() {
  useDocumentMeta({
    title: "Pricing",
    description:
      "OneApp pricing — start on Free today, unlock OneCommand and hosted AI on Pro, and move into Enterprise once teams arrive.",
    canonicalPath: "/pricing",
  });

  return (
    <div className="px-4 sm:px-6 pb-20">
      <RevealSection animation="blur" className="pt-12 sm:pt-20">
        <SectionHeading
          eyebrow="Pricing"
          title={
            <>
              Built for one founder.{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
                Free for now.
              </span>
            </>
          }
          description="OneApp's Free tier covers the founder's daily workflow. Pro and Enterprise unlock as later phases ship."
        />
      </RevealSection>

      <div className="max-w-6xl mx-auto mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {pricingTiers.map((tier, i) => (
          <RevealSection key={tier.id} animation="up" delay={i * 120}>
            <PricingTierCard tier={tier} />
          </RevealSection>
        ))}
      </div>

      <RevealSection animation="up" className="max-w-3xl mx-auto mt-20">
        <h3 className="text-center text-xl sm:text-2xl font-semibold mb-8 tracking-tight">
          Frequently asked
        </h3>
        <div className="space-y-4">
          {pricingFAQ.map((item) => (
            <div
              key={item.q}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-5"
            >
              <p className="font-medium text-gray-200 mb-1">{item.q}</p>
              <p className="text-sm text-gray-400 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </RevealSection>
    </div>
  );
}
