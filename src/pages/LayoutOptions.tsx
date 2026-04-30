import { useLayoutSettings, defaultSettings } from "@/hooks/useLayoutSettings";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { BackNavigation } from "@/components/navigation/BackNavigation";
import { cn } from "@/lib/utils";

export default function LayoutOptions() {
  const {
    settings,
    setSidebarWidth,
    setHeaderHeight,
    setLayoutStyle,
  } = useLayoutSettings();

  return (
    <div className="w-full space-y-6">
      <BackNavigation to="/customization/interface" label="Back to Interface" />

      {/* Sidebar Width */}
      <Card className="setting-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Sidebar Width</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Adjust the width of the sidebar. Range: 200px - 400px
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarWidth(defaultSettings.sidebarWidth)}
              className="text-xs"
            >
              Default
            </Button>
          </div>
          <div className="space-y-3">
            <Slider
              value={[settings.sidebarWidth]}
              onValueChange={([value]) => setSidebarWidth(value)}
              min={200}
              max={400}
              step={4}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>200px</span>
              <span className="text-primary font-medium">{settings.sidebarWidth}px</span>
              <span>400px</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header Height */}
      <Card className="setting-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Header Height</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Adjust the height of the header bar. Range: 48px - 80px
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHeaderHeight(defaultSettings.headerHeight)}
              className="text-xs"
            >
              Default
            </Button>
          </div>
          <div className="space-y-3">
            <Slider
              value={[settings.headerHeight]}
              onValueChange={([value]) => setHeaderHeight(value)}
              min={48}
              max={80}
              step={4}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>48px</span>
              <span className="text-primary font-medium">{settings.headerHeight}px</span>
              <span>80px</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout Style */}
      <Card className="setting-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Layout Style</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Choose between default (flush) or block style (with margins and rounded corners)
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLayoutStyle(defaultSettings.layoutStyle)}
              className="text-xs"
            >
              Default
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Default Layout Option */}
            <button
              onClick={() => setLayoutStyle("default")}
              className={cn(
                "p-4 rounded-lg border-2 transition-all text-left",
                settings.layoutStyle === "default"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/50"
              )}
            >
              {/* Layout Preview */}
              <div className="bg-background border border-border rounded-md overflow-hidden mb-3">
                <div className="flex h-28">
                  {/* Sidebar Preview */}
                  <div className="w-16 bg-muted border-r border-border flex-shrink-0" />
                  <div className="flex-1 flex flex-col">
                    {/* Header Preview */}
                    <div className="h-6 bg-muted border-b border-border" />
                    {/* Content Preview */}
                    <div className="flex-1 bg-card" />
                  </div>
                </div>
              </div>
              <h4 className="font-medium text-foreground">Default</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Sidebar and header are flush with the edges
              </p>
            </button>

            {/* Block Layout Option */}
            <button
              onClick={() => setLayoutStyle("block")}
              className={cn(
                "p-4 rounded-lg border-2 transition-all text-left",
                settings.layoutStyle === "block"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/50"
              )}
            >
              {/* Layout Preview */}
              <div className="bg-background border border-border rounded-md overflow-hidden p-2 mb-3">
                <div className="flex h-24 gap-2">
                  {/* Sidebar Preview */}
                  <div className="w-14 bg-muted rounded-lg flex-shrink-0" />
                  <div className="flex-1 flex flex-col gap-2">
                    {/* Header Preview */}
                    <div className="h-5 bg-muted rounded-lg" />
                    {/* Content Preview */}
                    <div className="flex-1 bg-card rounded-lg" />
                  </div>
                </div>
              </div>
              <h4 className="font-medium text-foreground">Block</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Sidebar and header have rounded corners and margins
              </p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
