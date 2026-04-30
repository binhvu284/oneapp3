import { useState } from "react";
import { StickyNote, Sparkles, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SimpleMode } from "@/components/onenote/SimpleMode";
import { ProMode } from "@/components/onenote/ProMode";

export default function OneNote() {
  const [mode, setMode] = useState<"simple" | "pro">("simple");

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] gap-0">
      {/* Toolbar header */}
      <div className="flex items-center justify-between px-1 py-1.5 shrink-0">
        <div />

        {/* Mode dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-muted/60 hover:bg-muted transition-colors">
              {mode === "simple" ? <StickyNote className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
              {mode === "simple" ? "Simple" : "Pro"}
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32 bg-popover border z-50">
            <DropdownMenuItem onClick={() => setMode("simple")} className={mode === "simple" ? "bg-accent" : ""}>
              <StickyNote className="w-3.5 h-3.5 mr-2" /> Simple
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setMode("pro")} className={mode === "pro" ? "bg-accent" : ""}>
              <Sparkles className="w-3.5 h-3.5 mr-2" /> Pro
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Right slot */}
        <div className="w-16" />
      </div>

      {/* Content area */}
      <div className="flex-1 min-h-0">
        {mode === "simple" ? <SimpleMode /> : <ProMode />}
      </div>
    </div>
  );
}
