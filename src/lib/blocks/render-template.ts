/**
 * Token substitution for note templates.
 *
 * Recognized tokens (case-insensitive): {{date}}, {{week}}, {{project_name}}.
 * Unknown tokens pass through untouched. Substitution operates on the
 * serialized JSON string so it's agnostic to block schema evolution — any
 * token that lands inside a string field will be replaced.
 */

export interface TemplateContext {
  project_name?: string;
  now?: Date;
}

function isoWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function buildTemplateTokens(ctx: TemplateContext = {}): Record<string, string> {
  const now = ctx.now ?? new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return {
    date: `${yyyy}-${mm}-${dd}`,
    week: `${yyyy}-W${String(isoWeek(now)).padStart(2, "0")}`,
    project_name: ctx.project_name ?? "",
  };
}

export function renderTemplate(raw: string, ctx: TemplateContext = {}): string {
  const tokens = buildTemplateTokens(ctx);
  return raw.replace(/\{\{\s*([a-zA-Z_]+)\s*\}\}/g, (_match, key: string) => {
    const k = key.toLowerCase();
    return Object.prototype.hasOwnProperty.call(tokens, k) ? tokens[k] : `{{${key}}}`;
  });
}
