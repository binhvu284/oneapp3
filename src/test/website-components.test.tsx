import { describe, it, expect, beforeAll, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { SectionHeading } from "@/components/website/SectionHeading";
import { ChangelogEntry } from "@/components/website/ChangelogEntry";
import { ModuleCard } from "@/components/website/ModuleCard";
import { PricingTierCard } from "@/components/website/PricingTierCard";
import { TimelineItem } from "@/components/website/TimelineItem";
import { changelog } from "@/data/changelog";
import { ecosystemModules } from "@/data/ecosystemModules";
import { pricingTiers } from "@/data/pricingTiers";

// jsdom lacks IntersectionObserver, which useScrollReveal (TimelineItem) needs.
beforeAll(() => {
  class IO {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal("IntersectionObserver", IO);
});

describe("Phase 5 website components", () => {
  it("SectionHeading renders eyebrow, title, and description", () => {
    render(<SectionHeading eyebrow="The roadmap" title="One system" description="Infinite control" />);
    expect(screen.getByText("The roadmap")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "One system" })).toBeInTheDocument();
    expect(screen.getByText("Infinite control")).toBeInTheDocument();
  });

  it("ChangelogEntry shows version, headline, and the Current badge", () => {
    const current = changelog.find((e) => e.isCurrent)!;
    render(<ChangelogEntry entry={current} />);
    expect(screen.getByText(`v${current.version}`)).toBeInTheDocument();
    expect(screen.getByText(current.headline!)).toBeInTheDocument();
    expect(screen.getByText("Current")).toBeInTheDocument();
  });

  it("ModuleCard renders the module name, tagline, and a status badge", () => {
    const live = ecosystemModules.find((m) => m.status === "live")!;
    render(<ModuleCard module={live} />);
    expect(screen.getByText(live.name)).toBeInTheDocument();
    expect(screen.getByText(live.tagline)).toBeInTheDocument();
    expect(screen.getByText("Live")).toBeInTheDocument();
  });

  it("PricingTierCard renders tier name, price, and CTA inside a router", () => {
    const free = pricingTiers.find((t) => t.id === "free")!;
    render(
      <MemoryRouter>
        <PricingTierCard tier={free} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: free.name })).toBeInTheDocument();
    expect(screen.getByText(free.price)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: free.cta.label })).toBeInTheDocument();
  });

  it("TimelineItem renders milestone version and headline without crashing", () => {
    const milestone = {
      id: "v3",
      version: "v3",
      date: "2026-05-01",
      headline: "OneApp 3 lands",
      summary: "The founder's OS upgrade.",
      features: ["Founder blocks", "Note linking"],
    };
    render(<TimelineItem milestone={milestone} index={0} />);
    expect(screen.getByText("v3")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "OneApp 3 lands" })).toBeInTheDocument();
    expect(screen.getByText("Founder blocks")).toBeInTheDocument();
  });
});
