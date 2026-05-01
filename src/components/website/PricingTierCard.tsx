import { Check, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import type { PricingTier } from "@/data/pricingTiers";

interface PricingTierCardProps {
  tier: PricingTier;
}

export function PricingTierCard({ tier }: PricingTierCardProps) {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const handleCta = () => {
    if (tier.cta.disabled) return;
    navigate(tier.cta.href);
  };

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { scale: 1.02, y: -4 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      className={cn(
        "relative rounded-2xl border bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6 sm:p-8 flex flex-col",
        tier.highlight
          ? "border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.12)]"
          : "border-white/10"
      )}
    >
      {tier.badge && (
        <span className="absolute -top-3 left-6 text-[10px] uppercase tracking-[0.2em] bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 px-3 py-1 rounded-full">
          {tier.badge}
        </span>
      )}

      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-xl font-semibold tracking-tight">{tier.name}</h3>
        {tier.comingSoon && (
          <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-gray-500">
            <Lock className="w-3 h-3" /> Soon
          </span>
        )}
      </div>

      <p className="text-sm text-gray-400 mb-6 leading-relaxed">{tier.description}</p>

      <div className="flex items-baseline gap-2 mb-6">
        <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
        <span className="text-sm text-gray-500">{tier.cadence}</span>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {tier.features.map((feature) => (
          <li key={feature} className="flex gap-3 text-sm text-gray-300">
            <Check
              className={cn(
                "w-4 h-4 mt-0.5 shrink-0",
                tier.highlight ? "text-cyan-400" : "text-gray-500"
              )}
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={handleCta}
        disabled={tier.cta.disabled}
        variant={tier.highlight ? "default" : "outline"}
        className={cn(
          "w-full",
          tier.highlight && "bg-cyan-500 hover:bg-cyan-400 text-black",
          tier.comingSoon && "opacity-60"
        )}
      >
        {tier.cta.label}
      </Button>
    </motion.div>
  );
}
