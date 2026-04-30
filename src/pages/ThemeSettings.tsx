import { Button } from "@/components/ui/button";
import { ArrowLeft, Sun, Palette, Check, RotateCcw } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useCustomTheme } from "@/hooks/useCustomTheme";
import { useState } from "react";
import { ColorPicker } from "@/components/theme/ColorPicker";
import { ThemePreviewPanel } from "@/components/theme/ThemePreviewPanel";
import { BackNavigation } from "@/components/navigation/BackNavigation";

type ThemeTemplate = {
  id: "light" | "dark";
  name: string;
  description: string;
  preview: {
    sidebar: string;
    main: string;
    accent: string;
    text: string;
  };
};

const themeTemplates: ThemeTemplate[] = [
  {
    id: "light",
    name: "Light",
    description: "Clean and bright theme perfect for daytime use. Easy on the eyes with high contrast.",
    preview: {
      sidebar: "hsl(210 20% 96%)",
      main: "hsl(0 0% 100%)",
      accent: "hsl(199 89% 48%)",
      text: "hsl(222 47% 11%)",
    },
  },
  {
    id: "dark",
    name: "Dark",
    description: "Dark theme for comfortable viewing in low-light environments. Reduces eye strain.",
    preview: {
      sidebar: "hsl(0 0% 10%)",
      main: "hsl(0 0% 4%)",
      accent: "hsl(199 89% 48%)",
      text: "hsl(210 40% 98%)",
    },
  },
];

function ThemePreview({ template, isLight }: { template: ThemeTemplate; isLight: boolean }) {
  return (
    <div 
      className="w-full h-32 rounded-lg overflow-hidden border border-border flex"
      style={{ backgroundColor: template.preview.main }}
    >
      <div 
        className="w-1/3 h-full p-3 flex flex-col gap-2"
        style={{ backgroundColor: template.preview.sidebar }}
      >
        <div 
          className="w-3/4 h-2 rounded"
          style={{ backgroundColor: template.preview.accent }}
        />
        <div 
          className="w-1/2 h-2 rounded opacity-50"
          style={{ backgroundColor: template.preview.accent }}
        />
      </div>
      <div className="flex-1 p-3 flex flex-col justify-center gap-2">
        <div 
          className="w-2/3 h-2 rounded"
          style={{ backgroundColor: template.preview.accent }}
        />
        <div 
          className="w-full h-8 rounded"
          style={{ 
            backgroundColor: isLight ? "hsl(222 47% 14%)" : "hsl(0 0% 8%)",
            opacity: isLight ? 0.1 : 1
          }}
        />
        <div 
          className="w-3/4 h-2 rounded"
          style={{ 
            backgroundColor: template.preview.text,
            opacity: 0.3
          }}
        />
      </div>
    </div>
  );
}

export default function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const { colors, setColors, resetColors, defaultColors } = useCustomTheme();
  const [view, setView] = useState<"main" | "templates" | "custom">("main");
  const [localColors, setLocalColors] = useState(colors);

  const selectedTheme = themeTemplates.find(t => t.id === theme) || themeTemplates[1];

  const handleApplyTheme = (themeId: "light" | "dark") => {
    setTheme(themeId);
    resetColors(); // Reset custom colors when switching templates
  };

  const handleColorChange = (key: keyof typeof localColors, value: string) => {
    const newColors = { ...localColors, [key]: value };
    setLocalColors(newColors);
    setColors(newColors); // Apply immediately for live preview
  };

  const handleResetColors = () => {
    setLocalColors(defaultColors);
    resetColors();
  };

  if (view === "templates") {
    return (
      <div className="w-full space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setView("main")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sun className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Choose from Templates</h2>
              <p className="text-sm text-muted-foreground">
                Select a pre-built theme template. Click on any theme to view detailed color information and apply it.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themeTemplates.map((t) => (
            <div 
              key={t.id}
              className={`setting-card cursor-pointer transition-all ${
                theme === t.id 
                  ? "ring-2 ring-primary" 
                  : "hover:border-primary/50"
              }`}
            >
              <ThemePreview template={t} isLight={t.id === "light"} />
              <h3 className="text-base font-semibold mt-3">{t.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
              <div className="flex gap-2 mt-4">
                <Button 
                  size="sm" 
                  onClick={() => handleApplyTheme(t.id)}
                  disabled={theme === t.id}
                  className="gap-2"
                >
                  {theme === t.id && <Check className="w-4 h-4" />}
                  {theme === t.id ? "Applied" : "Apply"}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  Detail
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === "custom") {
    return (
      <div className="w-full space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setView("main")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Customize Your Theme</h2>
              <p className="text-sm text-muted-foreground">
                Adjust colors for Main, Sidebar, and Header separately. Changes are applied in real-time.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Color Controls */}
          <div className="space-y-4">
            {/* Layout Colors */}
            <div className="setting-card space-y-4">
              <h3 className="text-base font-semibold border-b border-border pb-2">Layout Colors</h3>
              
              <ColorPicker
                label="Main Content"
                description="Background color for the main content area"
                value={localColors.main}
                onChange={(v) => handleColorChange("main", v)}
              />
              
              <ColorPicker
                label="Sidebar"
                description="Background color for the sidebar"
                value={localColors.sidebar}
                onChange={(v) => handleColorChange("sidebar", v)}
              />
              
              <ColorPicker
                label="Header"
                description="Background color for the header bar"
                value={localColors.header}
                onChange={(v) => handleColorChange("header", v)}
              />
              
              <ColorPicker
                label="Cards"
                description="Background color for cards and panels"
                value={localColors.card}
                onChange={(v) => handleColorChange("card", v)}
              />
            </div>

            {/* Accent & Text Colors */}
            <div className="setting-card space-y-4">
              <h3 className="text-base font-semibold border-b border-border pb-2">Accent & Text</h3>
              
              <ColorPicker
                label="Primary Accent"
                description="Primary accent color (buttons, links, highlights)"
                value={localColors.primary}
                onChange={(v) => handleColorChange("primary", v)}
              />
              
              <ColorPicker
                label="Text"
                description="Main text color"
                value={localColors.text}
                onChange={(v) => handleColorChange("text", v)}
              />
              
              <ColorPicker
                label="Muted Text"
                description="Secondary/muted text color"
                value={localColors.textMuted}
                onChange={(v) => handleColorChange("textMuted", v)}
              />
              
              <ColorPicker
                label="Border"
                description="Border color for sidebar, header, and cards"
                value={localColors.border}
                onChange={(v) => handleColorChange("border", v)}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleResetColors}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Default
              </Button>
            </div>
          </div>

          {/* Live Preview */}
          <div className="space-y-4">
            <div className="setting-card">
              <h3 className="text-base font-semibold mb-4">Live Preview</h3>
              <ThemePreviewPanel colors={localColors} />
              <p className="text-xs text-muted-foreground mt-3">
                This preview shows how your theme will look. Changes are applied immediately to the app.
              </p>
            </div>

            {/* Current Colors Summary */}
            <div className="setting-card">
              <h3 className="text-base font-semibold mb-3">Current Colors</h3>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(localColors).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div
                      className="w-full h-8 rounded-md border border-border mb-1"
                      style={{ backgroundColor: value }}
                    />
                    <p className="text-[10px] text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <BackNavigation to="/customization/interface" label="Back to Interface" />

      {/* Choose from Templates */}
      <div className="setting-card">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sun className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Choose from Templates</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Currently using a pre-built theme template. Click Change to select a different template.
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-lg border-2 border-primary bg-card">
          <ThemePreview template={selectedTheme} isLight={selectedTheme.id === "light"} />
          <h3 className="text-base font-semibold mt-3">{selectedTheme.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{selectedTheme.description}</p>
        </div>

        <Button 
          className="mt-4"
          onClick={() => setView("templates")}
        >
          Change Template
        </Button>
      </div>

      {/* Customize Your Theme */}
      <div className="setting-card">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Palette className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Customize Your Theme</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Fine-tune colors for Main, Sidebar, and Header independently. Full control over every component's appearance.
            </p>
          </div>
        </div>

        <Button 
          className="mt-4"
          onClick={() => setView("custom")}
        >
          Customize Colors
        </Button>
      </div>
    </div>
  );
}
