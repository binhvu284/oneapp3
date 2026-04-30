import { Moon, Sun, Monitor, Globe, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { BackNavigation } from "@/components/navigation/BackNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/hooks/useTheme";
import { useState, useEffect } from "react";

export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("app-language") || "en";
  });

  useEffect(() => {
    localStorage.setItem("app-language", language);
  }, [language]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <BackNavigation to="/settings" label="Settings" />

      <div>
        <h1 className="text-2xl font-bold text-foreground">Appearance</h1>
        <p className="text-muted-foreground mt-1">
          Customize how OneApp looks and feels
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === "dark" ? (
              <Moon className="w-5 h-5" />
            ) : theme === "system" ? (
              <Monitor className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
            Theme
          </CardTitle>
          <CardDescription>
            Choose between light and dark mode
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="theme-select">Color Theme</Label>
            <Select value={theme} onValueChange={(value: "light" | "dark") => setTheme(value)}>
              <SelectTrigger id="theme-select" className="w-full">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    Light Mode
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    Dark Mode
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    System Default
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Language
          </CardTitle>
          <CardDescription>
            Select your preferred language
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="language-select">Display Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language-select" className="w-full">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="vi">Tiếng Việt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Looking for more customization?
              </p>
              <p className="text-sm text-muted-foreground">
                Check out the full interface settings for advanced options
              </p>
            </div>
            <Link
              to="/customization/interface"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              Interface Settings
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
