import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DocsCodeBlock } from "./DocsCodeBlock";

interface DocsContentProps {
  content: string;
  title: string;
}

function HeadingWithAnchor({
  level,
  children,
}: {
  level: 2 | 3 | 4;
  children?: React.ReactNode;
}) {
  const [showCopy, setShowCopy] = useState(false);
  const [copied, setCopied] = useState(false);

  const text = String(children ?? "");
  const id = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const Tag = `h${level}` as "h2" | "h3" | "h4";
  const sizeClass = {
    2: "text-2xl font-bold mt-10 mb-4 pb-2 border-b border-border/50",
    3: "text-xl font-semibold mt-8 mb-3",
    4: "text-base font-semibold mt-6 mb-2",
  }[level];

  return (
    <Tag
      id={id}
      className={cn("group flex items-center gap-2 scroll-mt-24", sizeClass)}
      onMouseEnter={() => setShowCopy(true)}
      onMouseLeave={() => setShowCopy(false)}
    >
      {children}
      <button
        onClick={handleCopyLink}
        className={cn(
          "opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary",
          "text-xs px-1.5 py-0.5 rounded border border-border/50 hover:border-primary/50",
          "font-normal"
        )}
        title="Copy link"
      >
        {copied ? "✓" : "#"}
      </button>
    </Tag>
  );
}

export function DocsContent({ content }: DocsContentProps) {
  return (
    <div className="prose prose-invert max-w-none docs-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <HeadingWithAnchor level={2}>{children}</HeadingWithAnchor>
          ),
          h3: ({ children }) => (
            <HeadingWithAnchor level={3}>{children}</HeadingWithAnchor>
          ),
          h4: ({ children }) => (
            <HeadingWithAnchor level={4}>{children}</HeadingWithAnchor>
          ),
          p: ({ children }) => (
            <p className="text-muted-foreground leading-7 mb-4">{children}</p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="text-foreground font-semibold">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="text-foreground/80 italic">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="my-4 ml-4 space-y-1.5 text-muted-foreground list-none">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 ml-4 space-y-1.5 text-muted-foreground list-decimal list-inside">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-2">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
              <span>{children}</span>
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/40 pl-4 my-4 italic text-muted-foreground/80 bg-primary/5 py-2 pr-4 rounded-r-lg">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-xl border border-border/50">
              <table className="w-full text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/50">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left font-semibold text-foreground border-b border-border/50">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-muted-foreground border-b border-border/30 last:border-0">
              {children}
            </td>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-muted/20 transition-colors">{children}</tr>
          ),
          hr: () => <hr className="my-8 border-border/50" />,
          code: ({ children, className }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isBlock = className?.startsWith("language-");
            if (isBlock && match) {
              return (
                <DocsCodeBlock
                  code={String(children).replace(/\n$/, "")}
                  language={match[1]}
                />
              );
            }
            return (
              <code className="bg-muted/60 text-primary px-1.5 py-0.5 rounded text-[0.85em] font-mono border border-border/30">
                {children}
              </code>
            );
          },
          pre: ({ children }) => <>{children}</>,
        }}
      >
        {content}
      </ReactMarkdown>

      <style>{`
        .docs-content ol li {
          display: list-item;
          list-style-position: inside;
        }
      `}</style>
    </div>
  );
}
