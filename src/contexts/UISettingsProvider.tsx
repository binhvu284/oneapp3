import { ReactNode } from "react";
import { LayoutSettingsProvider } from "@/hooks/useLayoutSettings";
import { DisplaySettingsProvider } from "@/hooks/useDisplaySettings";
import { SidebarSettingsProvider } from "@/hooks/useSidebarSettings";
import { HeaderSettingsProvider } from "@/hooks/useHeaderSettings";
import { ThemeProvider } from "@/hooks/useTheme";

export function UISettingsProvider({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider>
            <LayoutSettingsProvider>
                <DisplaySettingsProvider>
                    <SidebarSettingsProvider>
                        <HeaderSettingsProvider>
                            {children}
                        </HeaderSettingsProvider>
                    </SidebarSettingsProvider>
                </DisplaySettingsProvider>
            </LayoutSettingsProvider>
        </ThemeProvider>
    );
}
