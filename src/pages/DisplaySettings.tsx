import { useDisplaySettings, FontFamily, TextSizeUnit } from "@/hooks/useDisplaySettings";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { BackNavigation } from "@/components/navigation/BackNavigation";
import { cn } from "@/lib/utils";

const fontOptions: { id: FontFamily; label: string; preview: string }[] = [
  { id: "system", label: "System", preview: "Aa" },
  { id: "sans-serif", label: "Sans-serif", preview: "Aa" },
  { id: "serif", label: "Serif", preview: "Aa" },
  { id: "monospace", label: "Monospace", preview: "Aa" },
];

const fontFamilyStyles: Record<FontFamily, string> = {
  system: "font-sans",
  "sans-serif": "font-sans",
  serif: "font-serif",
  monospace: "font-mono",
};

const unitOptions: { id: TextSizeUnit; label: string }[] = [
  { id: "px", label: "px" },
  { id: "em", label: "em" },
];

export default function DisplaySettings() {
  const {
    settings,
    setFontFamily,
    setTextSize,
    setTextSizeUnit,
    setLineHeight,
    setLetterSpacing,
    getTextSizeValue,
  } = useDisplaySettings();

  const getSliderConfig = () => {
    if (settings.textSizeUnit === "px") {
      return { min: 12, max: 24, step: 1 };
    }
    return { min: 0.75, max: 1.5, step: 0.05 };
  };

  const sliderConfig = getSliderConfig();

  return (
    <div className="w-full space-y-6">
      <BackNavigation to="/customization/interface" label="Back to Interface" />

      {/* Font Family */}
      <Card className="setting-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Font Family</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Choose the font family for the entire application. System uses your device's default font.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFontFamily("system")}
              className="text-xs"
            >
              Default
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {fontOptions.map((font) => (
              <button
                key={font.id}
                onClick={() => setFontFamily(font.id)}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all text-center",
                  settings.fontFamily === font.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
                )}
              >
                <span className={cn("text-3xl font-medium text-primary block mb-2", fontFamilyStyles[font.id])}>
                  {font.preview}
                </span>
                <span className="text-sm text-foreground">{font.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Text Size */}
      <Card className="setting-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Text Size</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Adjust the base text size for better readability. This affects all text throughout the application.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTextSizeUnit("px");
                setTextSize(16);
              }}
              className="text-xs"
            >
              Default
            </Button>
          </div>

          {/* Unit Selector */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Unit:</span>
            <div className="flex gap-1">
              {unitOptions.map((unit) => (
                <button
                  key={unit.id}
                  onClick={() => setTextSizeUnit(unit.id)}
                  className={cn(
                    "px-3 py-1 rounded-md text-sm font-medium transition-all",
                    settings.textSizeUnit === unit.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {unit.label}
                </button>
              ))}
            </div>
          </div>

          {/* Size Slider */}
          <div className="space-y-3">
            <Slider
              value={[settings.textSize]}
              onValueChange={([value]) => setTextSize(value)}
              min={sliderConfig.min}
              max={sliderConfig.max}
              step={sliderConfig.step}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{sliderConfig.min}{settings.textSizeUnit}</span>
              <span className="text-primary font-semibold text-base">
                {settings.textSizeUnit === "px" 
                  ? `${settings.textSize}px` 
                  : `${settings.textSize.toFixed(2)}em`}
              </span>
              <span>{sliderConfig.max}{settings.textSizeUnit}</span>
            </div>
          </div>

          {/* Preview */}
          <div
            className="mt-4 p-4 rounded-lg bg-muted/50"
            style={{ fontSize: getTextSizeValue() }}
          >
            <p className="text-foreground">The quick brown fox jumps over the lazy dog.</p>
            <p className="text-muted-foreground mt-2 text-xs" style={{ fontSize: "12px" }}>
              Preview of your selected text size: {getTextSizeValue()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Line Height */}
      <Card className="setting-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Line Height</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Control the spacing between lines of text. Higher values improve readability for longer text.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLineHeight(1.5)}
              className="text-xs"
            >
              Default
            </Button>
          </div>
          <div className="space-y-3">
            <Slider
              value={[settings.lineHeight]}
              onValueChange={([value]) => setLineHeight(value)}
              min={1}
              max={2}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>1.0</span>
              <span className="text-primary font-medium">{settings.lineHeight.toFixed(1)}</span>
              <span>2.0</span>
            </div>
          </div>
          <div
            className="mt-4 p-4 rounded-lg bg-muted/50 text-sm"
            style={{ lineHeight: settings.lineHeight }}
          >
            This is a preview of how your text will look with the selected line height. Multiple lines help you see the spacing effect.
          </div>
        </CardContent>
      </Card>

      {/* Letter Spacing */}
      <Card className="setting-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Letter Spacing</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Adjust the spacing between characters. This can improve readability for certain fonts.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLetterSpacing(0)}
              className="text-xs"
            >
              Default
            </Button>
          </div>
          <div className="space-y-3">
            <Slider
              value={[settings.letterSpacing]}
              onValueChange={([value]) => setLetterSpacing(value)}
              min={-0.05}
              max={0.2}
              step={0.01}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>-0.05em</span>
              <span className="text-primary font-medium">{settings.letterSpacing.toFixed(2)}em</span>
              <span>0.2em</span>
            </div>
          </div>
          <div
            className="mt-4 p-4 rounded-lg bg-muted/50 text-sm"
            style={{ letterSpacing: `${settings.letterSpacing}em` }}
          >
            Preview of letter spacing effect on your text content.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}