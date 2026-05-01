import { describe, it, expect } from "vitest";
import {
  createBlock,
  parseContent,
  serializeContent,
  extractPlainText,
  DECISION_LOCK_MS,
  SPRINT_MAX_CARDS,
} from "@/components/onenote/pro/block-types";
import {
  ideaPayloadSchema,
  decisionLogPayloadSchema,
  moodEnergyPayloadSchema,
  sprintPayloadSchema,
} from "@/lib/blocks/schemas";

describe("Phase 1 founder-mode blocks", () => {
  it("creates an idea block with safe defaults", () => {
    const b = createBlock("idea");
    expect(b.type).toBe("idea");
    expect(b.idea).toBeDefined();
    expect(b.idea?.validation_status).toBe("untested");
    expect(b.idea?.confidence).toBe(3);
    expect(ideaPayloadSchema.safeParse(b.idea).success).toBe(true);
  });

  it("creates a decision log block with ISO timestamp", () => {
    const b = createBlock("decision_log");
    expect(b.decision?.outcome).toBe("pending");
    expect(decisionLogPayloadSchema.safeParse(b.decision).success).toBe(true);
  });

  it("creates a mood/energy block", () => {
    const b = createBlock("mood_energy");
    expect(b.mood?.energy).toBe(3);
    expect(moodEnergyPayloadSchema.safeParse(b.mood).success).toBe(true);
  });

  it("creates a sprint block with empty card list", () => {
    const b = createBlock("sprint");
    expect(b.sprint?.cards).toEqual([]);
    expect(sprintPayloadSchema.safeParse(b.sprint).success).toBe(true);
  });

  it("round-trips founder blocks through parse/serialize", () => {
    const blocks = [
      createBlock("idea", { idea: { hypothesis: "x", validation_status: "validated", confidence: 4 } }),
      createBlock("sprint", {
        sprint: {
          cards: [{ id: "1", title: "A", column: "todo" }],
        },
      }),
    ];
    const raw = serializeContent({ blocks });
    const parsed = parseContent(raw);
    expect(parsed.blocks).toHaveLength(2);
    expect(parsed.blocks[0].idea?.hypothesis).toBe("x");
    expect(parsed.blocks[1].sprint?.cards[0].title).toBe("A");
  });

  it("plain-text extraction summarizes founder blocks", () => {
    const blocks = [
      createBlock("idea", { idea: { hypothesis: "ship sooner", validation_status: "untested", confidence: 5 } }),
      createBlock("mood_energy", {
        mood: { energy: 4, mood: "🚀", note: "good", recorded_at: new Date().toISOString() },
      }),
    ];
    const text = extractPlainText({ blocks });
    expect(text).toContain("ship sooner");
    expect(text).toContain("energy=4");
  });

  it("rejects sprint payloads exceeding the card cap", () => {
    const tooMany = Array.from({ length: SPRINT_MAX_CARDS + 1 }).map((_, i) => ({
      id: String(i),
      title: `c${i}`,
      column: "todo" as const,
    }));
    const result = sprintPayloadSchema.safeParse({ cards: tooMany });
    expect(result.success).toBe(false);
  });

  it("decision lock window is 24h", () => {
    expect(DECISION_LOCK_MS).toBe(24 * 60 * 60 * 1000);
  });
});
