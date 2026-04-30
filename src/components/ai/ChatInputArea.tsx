import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Send, Plus, Loader2, Brain, Upload, Globe, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { VoiceControls } from "./VoiceControls";

interface ChatInputAreaProps {
  message: string;
  onMessageChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  thinkHarder: boolean;
  onThinkHarderChange: (value: boolean) => void;
}

export function ChatInputArea({
  message,
  onMessageChange,
  onSend,
  disabled,
  isLoading,
  placeholder,
  thinkHarder,
  onThinkHarderChange,
}: ChatInputAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
  }, [message]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleTranscript = (text: string) => {
    onMessageChange(text);
  };

  return (
    <div className="flex-shrink-0 px-4 py-2 pb-5">
      {thinkHarder && (
        <div className="flex items-center gap-1.5 px-3 pb-2">
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="text-[11px] text-primary font-medium">Think Harder mode</span>
          <button
            onClick={() => onThinkHarderChange(false)}
            className="text-[11px] text-muted-foreground hover:text-foreground ml-1"
          >
            ✕
          </button>
        </div>
      )}
      <div className="relative flex items-end gap-1.5 bg-card border border-border rounded-2xl px-3 py-2">
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8 rounded-full">
              <Plus className={cn("w-5 h-5 text-muted-foreground transition-transform", menuOpen && "rotate-45")} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56">
            <DropdownMenuItem
              onClick={() => onThinkHarderChange(!thinkHarder)}
              className="gap-2"
            >
              <Brain className={cn("w-4 h-4", thinkHarder && "text-primary")} />
              <div className="flex-1">
                <span className="text-sm">Think Harder</span>
                <p className="text-[10px] text-muted-foreground">Use stronger model for complex tasks</p>
              </div>
              {thinkHarder && <span className="text-primary text-xs">ON</span>}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="gap-2 opacity-50">
              <Upload className="w-4 h-4" />
              <div className="flex-1">
                <span className="text-sm">Upload File</span>
                <p className="text-[10px] text-muted-foreground">Coming soon</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem disabled className="gap-2 opacity-50">
              <Globe className="w-4 h-4" />
              <div className="flex-1">
                <span className="text-sm">Web Search</span>
                <p className="text-[10px] text-muted-foreground">Coming soon</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          rows={1}
          className="flex-1 resize-none bg-transparent border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 py-1.5 max-h-[200px] scrollbar-thin"
        />

        <VoiceControls onTranscript={handleTranscript} isProcessing={isLoading || disabled} />

        <Button
          size="icon"
          className="flex-shrink-0 rounded-full h-10 w-10 text-primary-foreground bg-primary hover:bg-primary/90"
          disabled={!message.trim() || disabled || isLoading}
          onClick={onSend}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5 ml-1" />
          )}
        </Button>
      </div>
    </div>
  );
}
