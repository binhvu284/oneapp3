export interface JourneyMilestone {
  id: string;
  version: string;
  date: string;
  headline: string;
  summary: string;
  features: string[];
}

export const journeyMilestones: JourneyMilestone[] = [
  {
    id: "v1",
    version: "OneApp 1",
    date: "2024",
    headline: "A founder's notebook.",
    summary:
      "The first version was a pure note-taking tool — folders, inline tasks, three theme presets. Built to escape switching between Notion, a calendar, and a sticky-note app.",
    features: ["Notes + folders", "Inline tasks", "Three theme presets"],
  },
  {
    id: "v2",
    version: "OneApp 2",
    date: "2025",
    headline: "Modular workspace.",
    summary:
      "The notebook grew a custom auth system, a canvas dashboard, and the first sub-apps (OneAI, OneCrypto). Public landing pages went up. The architecture turned modular.",
    features: [
      "Custom oneapp_users auth",
      "Canvas dashboard with drag-resize widgets",
      "OneAI chat, OneCrypto portfolio, OneLibrary",
      "Explore / Ecosystem / Journey / Forum landing pages",
    ],
  },
  {
    id: "v3",
    version: "OneApp 3",
    date: "2026",
    headline: "The Founder's OS.",
    summary:
      "Eight phases turn the workspace into a real operating system: founder-mode notes, command center, AI that reads your data, neumorphic interface, public site, hierarchy, portable data, and crypto polish.",
    features: [
      "OneNote 3.0 — second brain (Phase 1, shipping)",
      "OneCommand — GitHub / Vercel / Supabase",
      "OneAI 3.0 — project-aware memory + voice",
      "Interface 3.0 — neumorphic dark + theme engine",
      "Website 3.0 — docs, changelog, pricing",
      "User Hierarchy 3.0 — granular permissions",
      "OneApp Data 3.0 — provider-agnostic backend",
      "OneCrypto 3.0 + foundation polish",
    ],
  },
];
