import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { Check, Palette } from "lucide-react";
import { BackNavigation } from "@/components/navigation/BackNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { useThemeEngine } from "@/hooks/useCustomTheme";
import { FF_THEME_ENGINE } from "@/lib/feature-flags";
import { PRESET_NAMES, THEME_PRESETS, type ThemePresetName } from "@/lib/themes";

/** Descriptions per preset — hue is derived from THEME_PRESETS to keep one source of truth. */
const PRESET_DESCRIPTIONS: Record<ThemePresetName, string> = {
  Midnight: "Deep black, sky-blue accent",
  Carbon:   "Graphite surfaces, indigo accent",
  Slate:    "Blue-grey, steel-blue accent",
  Arctic:   "Icy dark, cyan accent",
  Sand:     "Warm charcoal, amber accent",
  Obsidian: "Deep purple-black, violet accent",
};

export default function AppearanceThemes() {
  if (!FF_THEME_ENGINE) {
    return <Navigate to="/settings/appearance" replace />;
  }

  return <AppearanceThemesInner />;
}

function AppearanceThemesInner() {
  const { preset, accentHue, setPreset, setAccentHue, save, isSaving } = useThemeEngine();

  async function handleSave() {
    try {
      await save();
      toast.success("Theme saved", { description: "Your appearance preferences have been updated." });
    } catch {
      toast.error("Save failed", { description: "Could not save theme. Please try again." });
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <BackNavigation to="/settings/appearance" label="Appearance" />

      <div>
        <h1 className="text-2xl font-bold text-foreground">Themes</h1>
        <p className="text-muted-foreground mt-1">
          Choose a preset and fine-tune the accent color
        </p>
      </div>

      {/* ── Preset grid ───────────────────────────────────────────────────── */}
      <section aria-label="Theme presets">
        <Label className="mb-3 block text-sm font-medium text-foreground">Preset</Label>
        <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PRESET_NAMES.map((name) => {
            const swatchHue = Number(THEME_PRESETS[name]["--accent-hue"]);
            const isActive = preset === name;
            return (
              <StaggerItem key={name}>
                <Card
                  variant="neu"
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  onClick={() => setPreset(name)}
                  onKeyDown={(e) => e.key === "Enter" && setPreset(name)}
                  className={cn(
                    "cursor-pointer select-none transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-border",
                  )}
                >
                  <CardHeader className="p-4 pb-2">
                    {/* Accent swatch — hue derived from THEME_PRESETS (single source of truth). */}
                    <div
                      className="h-2 w-full rounded-full"
                      style={{ background: `hsl(${swatchHue} 89% 48%)` }}
                      aria-hidden
                    />
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{PRESET_DESCRIPTIONS[name]}</p>
                      </div>
                      {isActive && (
                        <Check
                          className="w-4 h-4 shrink-0 text-primary"
                          aria-label="Selected"
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      {/* ── Accent hue slider ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="w-4 h-4" />
            Accent Color
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="accent-hue-slider" className="text-sm text-muted-foreground">
              Hue
            </Label>
            <span className="text-sm font-mono text-foreground w-8 text-right">{accentHue}°</span>
          </div>
          {/* Full spectrum background track */}
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background:
                  "linear-gradient(to right, hsl(0 89% 48%), hsl(60 89% 48%), hsl(120 89% 48%), hsl(180 89% 48%), hsl(240 89% 48%), hsl(300 89% 48%), hsl(360 89% 48%))",
              }}
              aria-hidden
            />
            <input
              id="accent-hue-slider"
              type="range"
              min={0}
              max={360}
              value={accentHue}
              onChange={(e) => setAccentHue(Number(e.target.value))}
              className="relative w-full h-5 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-border [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-border"
              aria-valuetext={`Hue ${accentHue} degrees`}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Drag to preview — click Save to apply permanently.
          </p>
        </CardContent>
      </Card>

      {/* ── Save ──────────────────────────────────────────────────────────── */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving…" : "Save Theme"}
        </Button>
      </div>
    </div>
  );
}
