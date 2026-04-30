import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { BackNavigation } from "@/components/navigation/BackNavigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sun, Bell, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sun,
  Bell,
  Globe,
};

export default function HeaderSettings() {
  const { settings, toggleItem, updateItem } = useHeaderSettings();

  const enabledCount = settings.items.filter((i) => i.enabled).length;

  return (
    <div className="w-full space-y-6">
      <BackNavigation to="/customization/interface" label="Back to Interface" />

      {/* Header Items */}
      <Card className="setting-card">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Header Items</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Select which items should appear in the header (maximum {settings.maxItems}).
          </p>

          <div className="space-y-4">
            {settings.items.map((item) => {
              const Icon = iconMap[item.iconName] || Sun;
              const isDisabled = !item.enabled && enabledCount >= settings.maxItems;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "border rounded-lg p-4 transition-colors",
                    item.enabled ? "border-primary/50 bg-primary/5" : "border-border"
                  )}
                >
                  {/* Item Header */}
                  <label
                    className={cn(
                      "flex items-center gap-3 cursor-pointer",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Checkbox
                      checked={item.enabled}
                      onCheckedChange={() => !isDisabled && toggleItem(item.id)}
                      disabled={isDisabled}
                    />
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium text-foreground">{item.title}</span>
                  </label>

                  {/* Item Settings (only for Theme) */}
                  {item.enabled && item.id === "theme" && (
                    <div className="mt-4 pt-4 border-t border-border space-y-4">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground w-24">Display Type:</span>
                        <Select
                          value={item.displayType}
                          onValueChange={(value) =>
                            updateItem(item.id, { displayType: value as "toggle" | "button" | "dropdown" })
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="toggle">Toggle</SelectItem>
                            <SelectItem value="button">Button</SelectItem>
                            <SelectItem value="dropdown">Dropdown</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-muted-foreground block mb-1.5">Value 1:</label>
                          <Input
                            value={item.value1 || ""}
                            onChange={(e) => updateItem(item.id, { value1: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground block mb-1.5">Value 2:</label>
                          <Input
                            value={item.value2 || ""}
                            onChange={(e) => updateItem(item.id, { value2: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">Current Value:</span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={item.currentValue === item.value1 ? "default" : "outline"}
                            onClick={() => updateItem(item.id, { currentValue: item.value1 })}
                          >
                            {item.value1}
                          </Button>
                          <Button
                            size="sm"
                            variant={item.currentValue === item.value2 ? "default" : "outline"}
                            onClick={() => updateItem(item.id, { currentValue: item.value2 })}
                          >
                            {item.value2}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
