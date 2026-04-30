import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FileText, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareData {
  note_id: string;
  is_active: boolean;
  expires_at: string | null;
  notes: {
    title: string;
    content: string;
    note_type: string;
    updated_at: string;
  } | null;
}

function renderContent(content: string): string {
  try {
    const parsed = JSON.parse(content);
    if (!parsed?.blocks) return content;
    return parsed.blocks
      .map((b: any) => {
        switch (b.type) {
          case "heading": return `<h${b.level || 1} class="font-bold mt-4 mb-2 text-foreground">${b.content || ""}</h${b.level || 1}>`;
          case "quote": return `<blockquote class="border-l-4 border-primary pl-4 italic text-muted-foreground my-3">${b.content || ""}</blockquote>`;
          case "code": return `<pre class="bg-muted rounded p-3 my-3 text-sm overflow-x-auto"><code>${b.content || ""}</code></pre>`;
          case "divider": return `<hr class="border-border my-4" />`;
          case "checklist":
            return `<ul class="space-y-1 my-2">${(b.items || []).map((i: any) =>
              `<li class="flex items-center gap-2"><span class="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center text-xs">${i.checked ? "✓" : ""}</span><span class="${i.checked ? "line-through text-muted-foreground" : ""}">${i.content || ""}</span></li>`
            ).join("")}</ul>`;
          case "bullet-list":
            return `<ul class="list-disc list-inside space-y-1 my-2">${(b.items || []).map((i: any) =>
              `<li>${i.content || ""}</li>`
            ).join("")}</ul>`;
          case "numbered-list":
            return `<ol class="list-decimal list-inside space-y-1 my-2">${(b.items || []).map((i: any) =>
              `<li>${i.content || ""}</li>`
            ).join("")}</ol>`;
          default:
            return b.content ? `<p class="my-2 text-foreground">${b.content}</p>` : `<br />`;
        }
      })
      .join("");
  } catch {
    return `<p class="text-foreground">${content}</p>`;
  }
}

export default function PublicNote() {
  const { token } = useParams<{ token: string }>();
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { setError("Invalid share link"); setIsLoading(false); return; }

    const fetchNote = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("note_shares")
          .select("note_id, is_active, expires_at, notes(title, content, note_type, updated_at)")
          .eq("share_token", token)
          .eq("is_active", true)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (!data) { setError("This link is invalid or has been revoked."); return; }

        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          setError("This share link has expired."); return;
        }

        setShareData(data as ShareData);
      } catch {
        setError("Failed to load the note. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !shareData?.notes) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-6 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Note Not Found</h1>
        <p className="text-muted-foreground max-w-sm">{error ?? "This note could not be loaded."}</p>
        <Button asChild variant="outline">
          <Link to="/explore">Go to OneApp</Link>
        </Button>
      </div>
    );
  }

  const note = shareData.notes;

  return (
    <div className="min-h-screen bg-background">
      {/* Header bar */}
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <FileText className="w-4 h-4" />
            Shared Note
          </div>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link to="/explore">
              <ExternalLink className="w-3.5 h-3.5" />
              Open OneApp
            </Link>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">{note.title || "Untitled"}</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last updated {new Date(note.updated_at).toLocaleDateString("en-US", {
            year: "numeric", month: "long", day: "numeric",
          })}
        </p>
        <div
          className="prose prose-sm max-w-none text-foreground [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg"
          dangerouslySetInnerHTML={{ __html: renderContent(note.content) }}
        />
      </main>
    </div>
  );
}
