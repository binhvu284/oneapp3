import { LucideIcon, NotebookPen, Terminal, Sparkles, Coins, Database } from "lucide-react";

export interface EcosystemModule {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  accent: string; // tailwind hex - drives the card glow
  status: "live" | "coming_soon";
  bullets: string[];
}

export const ecosystemModules: EcosystemModule[] = [
  {
    id: "onenote",
    name: "OneNote 3.0",
    tagline: "Your actual second brain.",
    description:
      "Founder-mode blocks, bi-directional links, AI co-writer, and a daily briefing that meets you with the right context every morning.",
    icon: NotebookPen,
    accent: "#00F0FF",
    status: "live",
    bullets: ["Idea / Decision / Mood blocks", "[[note linking]] + backlinks", "Cmd+J inline AI"],
  },
  {
    id: "onecommand",
    name: "OneCommand",
    tagline: "Founder's control center.",
    description:
      "GitHub PRs, Vercel deploys, Supabase queries, and a supercharged Cmd+K palette — without ever leaving OneApp.",
    icon: Terminal,
    accent: "#A855F7",
    status: "coming_soon",
    bullets: ["GitHub + Vercel + Supabase", "Quick query runner", "Project status dashboard"],
  },
  {
    id: "oneai",
    name: "OneAI 3.0",
    tagline: "AI that knows your workspace.",
    description:
      "Project-aware memory, voice input, contextual actions, and a morning AI briefing built on your own data.",
    icon: Sparkles,
    accent: "#F472B6",
    status: "coming_soon",
    bullets: ["RAG over your notes", "ElevenLabs voice", "Action cards from chat"],
  },
  {
    id: "onecrypto",
    name: "OneCrypto 3.0",
    tagline: "Personal portfolio analyst.",
    description:
      "Live prices, AI-generated weekly summaries, custom price alerts, and benchmarks against BTC/ETH/S&P.",
    icon: Coins,
    accent: "#F59E0B",
    status: "live",
    bullets: ["Holdings + transactions", "Price alerts (P8)", "Performance vs benchmark"],
  },
  {
    id: "oneappdata",
    name: "OneApp Data 3.0",
    tagline: "Provider-agnostic data layer.",
    description:
      "Switch databases, schedule backups in JSON / SQL / CSV, monitor health in real time, and migrate schemas with one click.",
    icon: Database,
    accent: "#10B981",
    status: "coming_soon",
    bullets: ["Supabase + Firebase adapters", "Multi-format backups", "Auto schema migration"],
  },
];
