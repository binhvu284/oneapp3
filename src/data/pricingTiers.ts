export interface PricingTier {
  id: "free" | "pro" | "enterprise";
  name: string;
  price: string;
  cadence: string;
  badge?: string;
  description: string;
  features: string[];
  cta: { label: string; href: string; disabled?: boolean };
  highlight?: boolean;
  comingSoon?: boolean;
}

export const pricingTiers: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    cadence: "forever",
    description: "Everything you need to run your day from a single workspace.",
    badge: "Available now",
    features: [
      "OneNote 3.0 — founder-mode blocks, templates, daily briefing",
      "OneCrypto portfolio tracking",
      "OneAI chat with bring-your-own keys",
      "Customizable canvas dashboard",
      "Public docs, changelog, community access",
    ],
    cta: { label: "Get started", href: "/auth/signup" },
    highlight: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "TBD",
    cadence: "per month",
    description: "OneCommand, hosted AI, and team-of-one productivity tooling.",
    features: [
      "Everything in Free",
      "OneCommand — GitHub, Vercel, and Supabase from one panel",
      "Hosted AI (no key required) with monthly token pool",
      "Voice input via ElevenLabs",
      "Scheduled backups + multi-format export",
    ],
    cta: { label: "Coming soon", href: "#", disabled: true },
    comingSoon: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Contact",
    cadence: "custom",
    description: "For partners, agencies, and shared workspaces.",
    features: [
      "Everything in Pro",
      "User hierarchy 3.0 with per-user permission overrides",
      "Custom database provider — Supabase, Firebase, or self-hosted",
      "SLA-backed uptime + audit log retention",
      "Dedicated onboarding",
    ],
    cta: { label: "Coming soon", href: "#", disabled: true },
    comingSoon: true,
  },
];

export const pricingFAQ = [
  {
    q: "When will Pro and Enterprise be available?",
    a: "Pro unlocks once Phase 2 (OneCommand) and Phase 3 (OneAI 3.0) ship. Enterprise rides on Phase 6 (User Hierarchy) and Phase 7 (OneApp Data 3.0).",
  },
  {
    q: "Will my Free workspace stay free?",
    a: "Yes. The Free tier is the founder's daily driver — it's locked in.",
  },
  {
    q: "Do I need to bring my own AI keys today?",
    a: "On Free: yes, plug in your own Anthropic / ElevenLabs keys. On Pro: a hosted token pool is included.",
  },
];
