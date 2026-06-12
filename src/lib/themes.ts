/**
 * Phase 4 M4 — OneApp Theme Engine presets (PRD §6.3 F4.5).
 *
 * Each preset is a map of CSS custom property name → raw HSL channel value
 * (the part that goes inside `hsl(...)`). applyThemePreset injects them onto
 * `document.documentElement` via setProperty, which cascades to all derived
 * vars (e.g. --primary uses var(--accent-hue) so it updates automatically).
 *
 * IMPORTANT: all values are HSL *channel strings* — no hex, no full hsl().
 * The browser assembles `hsl(var(--accent-hue) ...)` at paint time.
 */

export type ThemePresetName = "Midnight" | "Carbon" | "Slate" | "Arctic" | "Sand" | "Obsidian";

/** A preset is a partial map of CSS var names → channel value strings. */
export type ThemeVars = Record<string, string>;

/**
 * Default accent hue matches the existing `--primary: 199 89% 48%`.
 * Keeping it at 199 means the CSS refactor (var(--accent-hue) 89% 48%) is a
 * zero-visual-change superset when no theme is applied.
 */
export const DEFAULT_ACCENT_HUE = 199;

export const THEME_PRESETS: Record<ThemePresetName, ThemeVars> = {
  /**
   * Midnight — the default OneApp look. Deep near-black background, sky-blue
   * accent (hue 199). Matches the base CSS without any override.
   */
  Midnight: {
    "--accent-hue": "199",
    "--background": "0 0% 4%",
    "--card": "0 0% 8%",
    "--neu-surface": "0 0% 8%",
    "--neu-shadow-dark": "0 0% 2%",
    "--neu-shadow-light": "0 0% 14%",
  },

  /**
   * Carbon — graphite-toned surfaces, indigo accent (hue 220).
   * A cooler, more corporate feel.
   */
  Carbon: {
    "--accent-hue": "220",
    "--background": "220 10% 5%",
    "--card": "220 10% 9%",
    "--neu-surface": "220 10% 9%",
    "--neu-shadow-dark": "220 10% 2%",
    "--neu-shadow-light": "220 10% 15%",
  },

  /**
   * Slate — blue-grey surfaces, steel-blue accent (hue 210).
   * Professional and muted.
   */
  Slate: {
    "--accent-hue": "210",
    "--background": "215 15% 7%",
    "--card": "215 12% 11%",
    "--neu-surface": "215 12% 11%",
    "--neu-shadow-dark": "215 12% 3%",
    "--neu-shadow-light": "215 12% 18%",
  },

  /**
   * Arctic — icy pale surfaces, cyan accent (hue 194).
   * High contrast, clean editorial aesthetic.
   */
  Arctic: {
    "--accent-hue": "194",
    "--background": "195 20% 6%",
    "--card": "195 18% 10%",
    "--neu-surface": "195 18% 10%",
    "--neu-shadow-dark": "195 18% 2%",
    "--neu-shadow-light": "195 18% 17%",
  },

  /**
   * Sand — warm amber surfaces, golden accent (hue 35).
   * Earthy and calm; suitable for daytime / focus modes.
   */
  Sand: {
    "--accent-hue": "35",
    "--background": "30 8% 6%",
    "--card": "30 8% 10%",
    "--neu-surface": "30 8% 10%",
    "--neu-shadow-dark": "30 8% 2%",
    "--neu-shadow-light": "30 8% 16%",
  },

  /**
   * Obsidian — deep purple-black, violet accent (hue 270).
   * Dramatic and immersive.
   */
  Obsidian: {
    "--accent-hue": "270",
    "--background": "265 12% 4%",
    "--card": "265 12% 8%",
    "--neu-surface": "265 12% 8%",
    "--neu-shadow-dark": "265 12% 1%",
    "--neu-shadow-light": "265 12% 14%",
  },
};

export const PRESET_NAMES = Object.keys(THEME_PRESETS) as ThemePresetName[];

// ─── Application helpers ──────────────────────────────────────────────────────

/**
 * Injects all CSS vars for the given preset onto `document.documentElement`.
 * The --accent-hue override propagates automatically to all derived vars
 * (--primary, --ring, --sidebar-primary, etc.) at paint time.
 */
export function applyThemePreset(name: ThemePresetName): void {
  const vars = THEME_PRESETS[name];
  if (!vars) throw new Error(`Unknown theme preset: "${name}"`);
  const root = document.documentElement;
  for (const [prop, value] of Object.entries(vars)) {
    root.style.setProperty(prop, value);
  }
}

/**
 * Sets only the --accent-hue CSS var (for the live hue slider).
 * Clamped to [0, 360].
 */
export function applyAccentHue(hue: number): void {
  const clamped = Math.max(0, Math.min(360, Math.round(hue)));
  document.documentElement.style.setProperty("--accent-hue", String(clamped));
}

// ─── localStorage FOUC guard ──────────────────────────────────────────────────

const LS_KEY = "oneapp-theme-engine";

export interface ThemeState {
  preset: ThemePresetName;
  accentHue: number;
}

export function getStoredThemeState(): ThemeState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "preset" in parsed &&
      "accentHue" in parsed &&
      (PRESET_NAMES as readonly string[]).includes((parsed as Record<string, unknown>).preset as string)
    ) {
      return parsed as ThemeState;
    }
    return null;
  } catch {
    return null;
  }
}

export function storeThemeState(state: ThemeState): void {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}
