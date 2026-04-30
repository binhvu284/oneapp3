import { useNavigate } from "react-router-dom";
import { AppIcon } from "@/components/icons/AppIcon";

const SHORTCUTS = [
  { label: "AI Chat", route: "/developing/ai/chat" },
  { label: "Library", route: "/library" },
  { label: "Crypto", route: "/apps/crypto" },
  { label: "Theme", route: "/customization/interface/theme" },
  { label: "Profile", route: "/profile" },
  { label: "Settings", route: "/settings" },
];

export default function MiniFunctionWidget() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-3 gap-2 h-full content-start">
      {SHORTCUTS.map((s) => (
        <button
          key={s.route}
          onClick={() => navigate(s.route)}
          className="flex flex-col items-center gap-1.5 p-2 rounded-md hover:bg-accent/10 transition-colors"
        >
          <AppIcon route={s.route} size="sm" />
          <span className="text-[10px] text-muted-foreground">{s.label}</span>
        </button>
      ))}
    </div>
  );
}
