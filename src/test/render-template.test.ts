import { describe, it, expect } from "vitest";
import { renderTemplate, buildTemplateTokens } from "@/lib/blocks/render-template";

describe("renderTemplate", () => {
  it("substitutes {{date}} and {{week}}", () => {
    const out = renderTemplate("date={{date}}, week={{week}}", { now: new Date("2026-04-01T10:00:00Z") });
    expect(out).toMatch(/date=2026-04-01/);
    expect(out).toMatch(/week=2026-W14/);
  });

  it("substitutes {{project_name}}", () => {
    const out = renderTemplate("# {{project_name}}", { project_name: "Atlas" });
    expect(out).toBe("# Atlas");
  });

  it("leaves unknown tokens untouched", () => {
    const out = renderTemplate("{{date}} and {{unknown_token}}", { now: new Date("2026-01-01") });
    expect(out).toContain("{{unknown_token}}");
  });

  it("buildTemplateTokens has all three keys", () => {
    const tokens = buildTemplateTokens({ now: new Date("2026-01-01"), project_name: "X" });
    expect(Object.keys(tokens).sort()).toEqual(["date", "project_name", "week"]);
  });
});
