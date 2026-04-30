import { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./CodeBlock";
import { StreamingCursor } from "./StreamingCursor";
import { Volume2, VolumeX } from "lucide-react";
import { speakText } from "./VoiceControls";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  agentIcon?: React.ReactNode;
  isStreaming?: boolean;
}

export const ChatMessage = memo(function ChatMessage({ role, content, agentIcon, isStreaming }: ChatMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleToggleSpeech = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speakText(content);
      // Polling to see when it finishes, rudimentary way
      const checkInterval = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          setIsPlaying(false);
          clearInterval(checkInterval);
        }
      }, 500);
    }
  };

  if (role === "user") {
    return (
      <div className="flex gap-3 max-w-[85%] ml-auto flex-row-reverse animate-fade-in mb-2">
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-primary text-primary-foreground shadow-sm">
          <span className="text-xs font-medium">You</span>
        </div>
        <div className="rounded-2xl px-4 py-2.5 bg-muted border border-border/50 shadow-sm text-foreground">
          <p className="text-[15px] whitespace-pre-wrap leading-relaxed">{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 max-w-full animate-fade-in mb-2 group">
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-background border border-border shadow-sm mt-0.5">
        {agentIcon}
      </div>
      <div className="flex-1 min-w-0 max-w-none text-[15px] text-foreground leading-relaxed">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-4 pb-2 border-b border-border/50">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xl font-semibold mt-6 mb-3 pb-1.5 border-b border-border/30">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-medium mt-5 mb-2">{children}</h3>,
            h4: ({ children }) => <h4 className="text-base font-medium mt-4 mb-2">{children}</h4>,
            p: ({ children }) => <p className="mb-4 last:mb-0 text-foreground/90">{children}</p>,
            ul: ({ children }) => <ul className="mb-4 ml-5 list-disc space-y-1.5 marker:text-foreground/40">{children}</ul>,
            ol: ({ children }) => <ol className="mb-4 ml-5 list-decimal space-y-1.5 marker:text-foreground/40">{children}</ol>,
            li: ({ children, ...props }) => {
              const taskListItem = props as { className?: string };
              if (taskListItem.className?.includes("task-list-item")) {
                return <li className="list-none flex items-start gap-2 mb-1.5">{children}</li>;
              }
              return <li className="pl-1 text-foreground/90">{children}</li>;
            },
            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-primary/50 pl-4 py-1.5 my-4 bg-primary/5 rounded-r-lg italic text-foreground/80">
                {children}
              </blockquote>
            ),
            input: ({ type, checked, ...props }) => {
              if (type === "checkbox") {
                return (
                  <input
                    type="checkbox"
                    checked={checked}
                    readOnly
                    className="mt-1 rounded-sm border-border accent-primary shrink-0 transition-colors"
                    {...props}
                  />
                );
              }
              return <input type={type} {...props} />;
            },
            code: ({ className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || "");
              const isBlock = !!className;
              if (isBlock) {
                const codeString = String(children).replace(/\n$/, "");
                return (
                  <div className="my-5 overflow-hidden rounded-xl border border-border/50 shadow-sm bg-zinc-950 dark:bg-black/40 text-gray-50">
                    <CodeBlock language={match?.[1]}>{codeString}</CodeBlock>
                  </div>
                );
              }
              return (
                <code className="bg-muted/80 text-foreground px-1.5 py-0.5 rounded-md text-[13px] font-mono border border-border/30">
                  {children}
                </code>
              );
            },
            pre: ({ children }) => <>{children}</>,
            table: ({ children }) => (
              <div className="my-5 rounded-xl border border-border/60 overflow-hidden shadow-sm">
                <Table>{children}</Table>
              </div>
            ),
            thead: ({ children }) => <TableHeader className="bg-muted/50">{children}</TableHeader>,
            tbody: ({ children }) => <TableBody>{children}</TableBody>,
            tr: ({ children }) => <TableRow className="hover:bg-muted/30 transition-colors">{children}</TableRow>,
            th: ({ children }) => (
              <TableHead className="font-semibold whitespace-nowrap px-4 py-3">{children}</TableHead>
            ),
            td: ({ children }) => (
              <TableCell className="px-4 py-3 align-top leading-relaxed">{children}</TableCell>
            ),
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 font-medium underline underline-offset-4 decoration-primary/30 hover:decoration-primary/80 transition-colors">
                {children}
              </a>
            ),
            img: ({ src, alt }) => (
              <img src={src} alt={alt || ""} className="rounded-xl max-w-full h-auto my-5 shadow-sm border border-border/30 object-cover" loading="lazy" />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
        {isStreaming && (
          <div className="mt-2">
            <StreamingCursor />
          </div>
        )}
        {!isStreaming && (
          <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-7 w-7 rounded-sm", isPlaying && "text-primary")}
              onClick={handleToggleSpeech}
              title={isPlaying ? "Stop speaking" : "Read aloud"}
            >
              {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
});
