import { useCallback, useState } from "react";
import { useAuthSource as useAuth } from "@/hooks/useAuthSource";

export type InlineAIAction =
  | "continue"
  | "summarize"
  | "ideas"
  | "grammar"
  | "translate_en"
  | "translate_vi";

interface RunArgs {
  action: InlineAIAction;
  above: string[];
  current: string;
  below: string[];
}

interface InlineAIState {
  output: string;
  isStreaming: boolean;
  error: string | null;
}

const URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/inline-ai`;

/**
 * Streams a response from the inline-ai edge function for the chosen action.
 * Returns state plus a `run()` callback the panel can call when the user picks
 * an action. Stream chunks accumulate into `output` for live preview.
 */
export function useInlineAI() {
  const { oneappToken } = useAuth();
  const [state, setState] = useState<InlineAIState>({ output: "", isStreaming: false, error: null });

  const reset = useCallback(() => setState({ output: "", isStreaming: false, error: null }), []);

  const run = useCallback(
    async (args: RunArgs) => {
      if (!oneappToken) {
        setState({ output: "", isStreaming: false, error: "Sign in required" });
        return;
      }
      setState({ output: "", isStreaming: true, error: null });
      try {
        const resp = await fetch(URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${oneappToken}`,
          },
          body: JSON.stringify({
            action: args.action,
            context: { above: args.above, current: args.current, below: args.below },
          }),
        });

        if (!resp.ok) {
          let msg = `HTTP ${resp.status}`;
          try {
            const j = await resp.json();
            if (typeof j.error === "string") msg = j.error;
          } catch {
            /* ignore */
          }
          setState({ output: "", isStreaming: false, error: msg });
          return;
        }

        if (!resp.body) {
          setState({ output: "", isStreaming: false, error: "Empty response" });
          return;
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let acc = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const payload = line.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;
            try {
              const j = JSON.parse(payload);
              const piece =
                j?.delta?.text ??
                j?.content_block?.text ??
                "";
              if (piece) {
                acc += piece;
                setState({ output: acc, isStreaming: true, error: null });
              }
            } catch {
              /* ignore non-JSON SSE lines */
            }
          }
        }

        setState({ output: acc, isStreaming: false, error: null });
      } catch (err) {
        setState({
          output: "",
          isStreaming: false,
          error: err instanceof Error ? err.message : "Inline AI failed",
        });
      }
    },
    [oneappToken]
  );

  return { ...state, run, reset };
}
