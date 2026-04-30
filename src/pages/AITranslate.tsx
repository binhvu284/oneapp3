import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ArrowLeftRight, ChevronDown, Check, Copy, Loader2, Trash2 } from "lucide-react";
import { useAIModelConnection } from "@/hooks/useAIModelConnection";
import { useAuthSource } from "@/hooks/useAuthSource";
import { AI_PROVIDERS } from "@/config/aiProviders";
import { toast } from "sonner";
import type { AIAgent } from "@/types/ai";

const LANGUAGES = [
  { code: "auto", label: "Detect language" },
  { code: "en", label: "English" },
  { code: "vi", label: "Vietnamese" },
  { code: "zh", label: "Chinese (Simplified)" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "es", label: "Spanish" },
  { code: "pt", label: "Portuguese" },
  { code: "ru", label: "Russian" },
  { code: "ar", label: "Arabic" },
  { code: "hi", label: "Hindi" },
  { code: "th", label: "Thai" },
  { code: "id", label: "Indonesian" },
  { code: "it", label: "Italian" },
  { code: "nl", label: "Dutch" },
  { code: "pl", label: "Polish" },
  { code: "tr", label: "Turkish" },
];

const TARGET_LANGUAGES = LANGUAGES.filter(l => l.code !== "auto");

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

export default function AITranslate() {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("en");
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);

  const { connections, enabled, githubActiveModel } = useAIModelConnection();
  const { oneappToken } = useAuthSource();

  const availableAgents = useMemo<AIAgent[]>(() => {
    return AI_PROVIDERS
      .filter(p => connections[p.id as keyof typeof connections] && enabled[p.id as keyof typeof enabled])
      .map(p => ({
        id: p.id,
        name: p.name,
        modelVersion: p.id === "github" ? (githubActiveModel || p.defaultModel) : p.defaultModel,
        type: p.type,
        icon: p.icon,
      }));
  }, [connections, enabled, githubActiveModel]);

  const activeAgent = selectedAgent ?? availableAgents[0] ?? null;

  const sourceLangLabel = LANGUAGES.find(l => l.code === sourceLang)?.label ?? "Auto";
  const targetLangLabel = TARGET_LANGUAGES.find(l => l.code === targetLang)?.label ?? "English";

  const handleSwap = () => {
    if (sourceLang === "auto") return;
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleTranslate = async () => {
    if (!sourceText.trim() || !activeAgent || isTranslating) return;
    if (!oneappToken) { toast.error("Please sign in to use AI Translate"); return; }

    setIsTranslating(true);
    setTranslatedText("");

    const fromLabel = sourceLang === "auto" ? "the source language (auto-detect)" : sourceLangLabel;
    const systemPrompt = `You are a professional translator. Translate the following text from ${fromLabel} to ${targetLangLabel}. Output ONLY the translated text, no explanations, no notes, no quotation marks around the result.`;

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${oneappToken}`,
        },
        body: JSON.stringify({
          messages: [
            { role: "user", content: sourceText.trim() },
          ],
          provider: activeAgent.id,
          systemPrompt,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `Error ${resp.status}`);
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 1);
          if (line.startsWith("data: ")) {
            const payload = line.slice(6);
            if (payload === "[DONE]") break;
            try {
              const parsed = JSON.parse(payload);
              const chunk = parsed.choices?.[0]?.delta?.content ?? parsed.content ?? "";
              result += chunk;
              setTranslatedText(result);
            } catch { /* skip malformed lines */ }
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Translation failed";
      toast.error(msg);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Translate</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Translate text between languages using AI</p>
        </div>

        {/* Model selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 h-9">
              {activeAgent ? (
                <>
                  {activeAgent.icon}
                  <span className="text-sm">{activeAgent.name}</span>
                </>
              ) : "No model"}
              <ChevronDown className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {availableAgents.length > 0 ? (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground">Translation Model</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availableAgents.map(agent => (
                  <DropdownMenuItem key={agent.id} onClick={() => setSelectedAgent(agent)} className="flex items-center gap-2">
                    <span className="flex-shrink-0">{agent.icon}</span>
                    <span className="flex-1 truncate">{agent.name}</span>
                    <Check className={`w-3 h-3 flex-shrink-0 ${activeAgent?.id === agent.id ? "opacity-100" : "opacity-0"}`} />
                  </DropdownMenuItem>
                ))}
              </>
            ) : (
              <DropdownMenuItem disabled>Connect a model in OneApp AI</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Language bar */}
      <div className="flex items-center gap-3">
        <Select value={sourceLang} onValueChange={setSourceLang}>
          <SelectTrigger className="w-48 h-9">
            <SelectValue>{sourceLangLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map(l => (
              <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 flex-shrink-0"
          onClick={handleSwap}
          disabled={sourceLang === "auto"}
          title="Swap languages"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </Button>

        <Select value={targetLang} onValueChange={setTargetLang}>
          <SelectTrigger className="w-48 h-9">
            <SelectValue>{targetLangLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {TARGET_LANGUAGES.map(l => (
              <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={handleTranslate}
          disabled={!sourceText.trim() || !activeAgent || isTranslating}
          className="ml-auto gap-2 h-9"
        >
          {isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {isTranslating ? "Translating..." : "Translate"}
        </Button>
      </div>

      {/* Text areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source */}
        <div className="relative">
          <Textarea
            placeholder="Enter text to translate..."
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            className="min-h-[280px] resize-none bg-card border-border text-foreground placeholder:text-muted-foreground text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleTranslate();
            }}
          />
          {sourceText && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => { setSourceText(""); setTranslatedText(""); }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {sourceText.length} chars · Ctrl+Enter to translate
          </p>
        </div>

        {/* Output */}
        <div className="relative">
          <Textarea
            readOnly
            placeholder={isTranslating ? "Translating..." : "Translation will appear here..."}
            value={translatedText}
            className="min-h-[280px] resize-none bg-muted/30 border-border text-foreground placeholder:text-muted-foreground text-sm"
          />
          {translatedText && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={handleCopy}
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>
          )}
          {isTranslating && (
            <div className="absolute bottom-3 left-3">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
