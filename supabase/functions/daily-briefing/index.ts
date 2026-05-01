import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verify } from "https://deno.land/x/djwt@v3.0.1/mod.ts";
import { getCorsHeaders, getJwtSecret } from "../_shared/config.ts";

interface BriefingSection {
  due_today: { id: string; content: string }[];
  open_decisions: { note_id: string; note_title: string; decision: string }[];
  yesterday_mood: { energy: number; mood: string; note?: string } | null;
  untested_ideas: { note_id: string; note_title: string; hypothesis: string }[];
  bookmarks: { id: string; title: string }[];
}

async function getJwtKey() {
  const keyData = new TextEncoder().encode(getJwtSecret());
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function todayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildBlocks(today: string, sections: BriefingSection) {
  const blocks: Array<Record<string, unknown>> = [
    { id: crypto.randomUUID(), type: "heading", level: 1, content: `Daily Briefing — ${today}` },
  ];

  blocks.push({ id: crypto.randomUUID(), type: "heading", level: 2, content: "Due today" });
  if (sections.due_today.length === 0) {
    blocks.push({ id: crypto.randomUUID(), type: "paragraph", content: "—" });
  } else {
    blocks.push({
      id: crypto.randomUUID(),
      type: "checklist",
      items: sections.due_today.map((it) => ({
        id: crypto.randomUUID(),
        content: it.content || "(untitled task)",
        checked: false,
      })),
    });
  }

  blocks.push({ id: crypto.randomUUID(), type: "heading", level: 2, content: "Open decisions" });
  if (sections.open_decisions.length === 0) {
    blocks.push({ id: crypto.randomUUID(), type: "paragraph", content: "—" });
  } else {
    for (const d of sections.open_decisions) {
      blocks.push({ id: crypto.randomUUID(), type: "paragraph", content: `• ${d.decision} (${d.note_title})` });
    }
  }

  blocks.push({ id: crypto.randomUUID(), type: "heading", level: 2, content: "Yesterday's mood" });
  if (sections.yesterday_mood) {
    const m = sections.yesterday_mood;
    blocks.push({
      id: crypto.randomUUID(),
      type: "paragraph",
      content: `${m.mood} — energy ${m.energy}/5${m.note ? " — " + m.note : ""}`,
    });
  } else {
    blocks.push({ id: crypto.randomUUID(), type: "paragraph", content: "—" });
  }

  blocks.push({ id: crypto.randomUUID(), type: "heading", level: 2, content: "Untested ideas" });
  if (sections.untested_ideas.length === 0) {
    blocks.push({ id: crypto.randomUUID(), type: "paragraph", content: "—" });
  } else {
    for (const i of sections.untested_ideas) {
      blocks.push({
        id: crypto.randomUUID(),
        type: "paragraph",
        content: `• ${i.hypothesis} (${i.note_title})`,
      });
    }
  }

  blocks.push({ id: crypto.randomUUID(), type: "heading", level: 2, content: "Bookmarks" });
  if (sections.bookmarks.length === 0) {
    blocks.push({ id: crypto.randomUUID(), type: "paragraph", content: "—" });
  } else {
    for (const b of sections.bookmarks) {
      blocks.push({ id: crypto.randomUUID(), type: "paragraph", content: `• ${b.title}` });
    }
  }

  return blocks;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    let userId: string;
    try {
      const payload = await verify(token, await getJwtKey()) as Record<string, unknown>;
      userId = payload.sub as string;
      if (!userId) throw new Error("missing sub");
    } catch {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const today = todayDateString();

    // 1. Existing briefing? Idempotent — return it.
    const { data: existing } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .eq("note_type", "daily_briefing")
      .eq("note_date", today)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ note: existing, created: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Gather sections
    const [tasksRes, recentNotesRes, bookmarksRes] = await Promise.all([
      supabase
        .from("note_items")
        .select("id, content")
        .eq("user_id", userId)
        .eq("is_completed", false)
        .eq("due_date", today),
      supabase
        .from("notes")
        .select("id, title, content, updated_at")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(50),
      supabase
        .from("notes")
        .select("id, title")
        .eq("user_id", userId)
        .eq("is_bookmarked", true)
        .limit(10),
    ]);

    const sections: BriefingSection = {
      due_today: (tasksRes.data ?? []) as BriefingSection["due_today"],
      open_decisions: [],
      yesterday_mood: null,
      untested_ideas: [],
      bookmarks: (bookmarksRes.data ?? []) as BriefingSection["bookmarks"],
    };

    const sevenDaysAgo = Date.now() - 7 * 86400000;
    const threeDaysAgo = Date.now() - 3 * 86400000;
    const yesterday = new Date(Date.now() - 86400000);
    const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).getTime();
    const yesterdayEnd = yesterdayStart + 86400000;

    for (const n of recentNotesRes.data ?? []) {
      try {
        const parsed = JSON.parse((n as { content: string }).content || "{}");
        const blocks: Array<Record<string, unknown>> = parsed.blocks ?? [];
        for (const b of blocks) {
          const type = b.type as string;
          if (type === "decision_log" && b.decision) {
            const d = b.decision as { decided_at: string; outcome: string; decision: string };
            const dt = new Date(d.decided_at).getTime();
            if (d.outcome === "pending" && dt > sevenDaysAgo) {
              sections.open_decisions.push({
                note_id: (n as { id: string }).id,
                note_title: (n as { title: string }).title || "Untitled",
                decision: d.decision,
              });
            }
          } else if (type === "idea" && b.idea) {
            const i = b.idea as { hypothesis: string; validation_status: string };
            if (i.validation_status === "untested") {
              const updatedAt = new Date((n as { updated_at: string }).updated_at).getTime();
              if (updatedAt < threeDaysAgo) {
                sections.untested_ideas.push({
                  note_id: (n as { id: string }).id,
                  note_title: (n as { title: string }).title || "Untitled",
                  hypothesis: i.hypothesis,
                });
              }
            }
          } else if (type === "mood_energy" && b.mood && !sections.yesterday_mood) {
            const m = b.mood as { recorded_at: string; energy: number; mood: string; note?: string };
            const t = new Date(m.recorded_at).getTime();
            if (t >= yesterdayStart && t < yesterdayEnd) {
              sections.yesterday_mood = { energy: m.energy, mood: m.mood, note: m.note };
            }
          }
        }
      } catch {
        /* ignore malformed content */
      }
    }

    const blocks = buildBlocks(today, sections);
    const { data: inserted, error: insertErr } = await supabase
      .from("notes")
      .insert({
        user_id: userId,
        title: `Daily Briefing — ${today}`,
        content: JSON.stringify({ blocks }),
        note_type: "daily_briefing",
        note_date: today,
      })
      .select()
      .single();

    if (insertErr) {
      // Unique index race — fetch what's there.
      const { data: race } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", userId)
        .eq("note_type", "daily_briefing")
        .eq("note_date", today)
        .maybeSingle();
      return new Response(JSON.stringify({ note: race, created: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ note: inserted, created: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("daily-briefing failed", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
