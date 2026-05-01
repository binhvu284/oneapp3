import { describe, it, expect } from "vitest";
import { extractLinkTitlesFromContent } from "@/lib/blocks/extract-links";
import { createBlock } from "@/components/onenote/pro/block-types";

describe("note-link extraction", () => {
  it("picks up [[Title]] from paragraph content", () => {
    const blocks = [createBlock("paragraph", { content: "see [[Brand Doc]] and [[Roadmap]]" })];
    const titles = extractLinkTitlesFromContent({ blocks });
    expect(titles).toContain("Brand Doc");
    expect(titles).toContain("Roadmap");
  });

  it("dedupes repeated titles", () => {
    const blocks = [
      createBlock("paragraph", { content: "[[A]] and [[A]]" }),
      createBlock("paragraph", { content: "again [[A]]" }),
    ];
    const titles = extractLinkTitlesFromContent({ blocks });
    expect(titles).toEqual(["A"]);
  });

  it("scans founder block text fields too", () => {
    const blocks = [
      createBlock("idea", {
        idea: { hypothesis: "ties to [[Vision Doc]]", validation_status: "untested", confidence: 3 },
      }),
      createBlock("decision_log", {
        decision: {
          decision: "see [[Decision Brief]]",
          reasoning: "",
          decided_at: new Date().toISOString(),
          outcome: "pending",
        },
      }),
    ];
    const titles = extractLinkTitlesFromContent({ blocks });
    expect(titles).toEqual(expect.arrayContaining(["Vision Doc", "Decision Brief"]));
  });

  it("ignores empty link tokens", () => {
    const blocks = [createBlock("paragraph", { content: "no link [[]] here" })];
    const titles = extractLinkTitlesFromContent({ blocks });
    expect(titles).toEqual([]);
  });
});
