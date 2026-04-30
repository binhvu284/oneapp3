import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  language?: string;
  children: string;
}

export function CodeBlock({ language, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayLang = language?.replace(/^language-/, "") || "code";

  return (
    <div className="relative group my-3 rounded-lg border border-border overflow-hidden bg-muted/50">
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted border-b border-border">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          {displayLang}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto w-full">
        <SyntaxHighlighter
          language={displayLang}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: "1rem",
            fontSize: "0.875rem",
            background: "transparent",
            minHeight: "2.5rem",
          }}
          PreTag="div"
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
