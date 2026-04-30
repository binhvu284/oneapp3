import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";

interface DocsCodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function DocsCodeBlock({ code, language = "text", className }: DocsCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("relative group my-4 rounded-xl overflow-hidden border border-white/10", className)}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
        <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-white/10"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: "0.85rem",
          lineHeight: "1.6",
          background: "rgba(0,0,0,0.4)",
        }}
        showLineNumbers={code.split("\n").length > 5}
        lineNumberStyle={{ color: "rgba(255,255,255,0.2)", fontSize: "0.75rem" }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
