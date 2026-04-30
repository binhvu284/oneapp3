import { GeminiIcon } from "@/components/icons/GeminiIcon";
import { ChatGPTIcon } from "@/components/icons/ChatGPTIcon";
import { ClaudeIcon } from "@/components/icons/ClaudeIcon";
import { PerplexityIcon } from "@/components/icons/PerplexityIcon";
import { GrokIcon } from "@/components/icons/GrokIcon";
import { DeepSeekIcon } from "@/components/icons/DeepSeekIcon";
import { GroqIcon } from "@/components/icons/GroqIcon";
import { ExaIcon } from "@/components/icons/ExaIcon";
import { Github } from "lucide-react";
import type { AIProviderId } from "@/types/ai";

export interface AIProviderConfig {
  id: AIProviderId;
  name: string;
  defaultModel: string;
  icon: React.ReactNode;
  /** "agent" providers (GitHub, Groq, Exa) vs plain "model" providers */
  type: "agent" | "model";
}

export const AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: "github",
    name: "GitHub Models",
    defaultModel: "gpt-4o",
    type: "agent",
    icon: <Github className="w-5 h-5 text-gray-800 dark:text-gray-200" />,
  },
  {
    id: "groq",
    name: "Groq Cloud",
    defaultModel: "LLaMA3-8b",
    type: "agent",
    icon: <GroqIcon className="w-5 h-5 text-orange-500" />,
  },
  {
    id: "exa",
    name: "Exa Search",
    defaultModel: "Exa Search Agent",
    type: "agent",
    icon: <ExaIcon className="w-5 h-5 text-purple-600" />,
  },
  {
    id: "gemini",
    name: "Gemini",
    defaultModel: "Gemini 2.5 Flash",
    type: "model",
    icon: <GeminiIcon className="w-5 h-5 text-blue-500" />,
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    defaultModel: "GPT-4o Mini",
    type: "model",
    icon: <ChatGPTIcon className="w-5 h-5 text-emerald-500" />,
  },
  {
    id: "claude",
    name: "Claude",
    defaultModel: "Claude 3 Haiku",
    type: "model",
    icon: <ClaudeIcon className="w-5 h-5 text-amber-600" />,
  },
  {
    id: "perplexity",
    name: "Perplexity",
    defaultModel: "Sonar Small Chat",
    type: "model",
    icon: <PerplexityIcon className="w-5 h-5 text-cyan-500" />,
  },
  {
    id: "grok",
    name: "Grok",
    defaultModel: "Grok Beta",
    type: "model",
    icon: <GrokIcon className="w-5 h-5 text-black dark:text-white" />,
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    defaultModel: "DeepSeek Chat",
    type: "model",
    icon: <DeepSeekIcon className="w-5 h-5 text-blue-600" />,
  },
];

export const AI_AGENTS = AI_PROVIDERS.filter((p) => p.type === "agent");
export const AI_MODELS = AI_PROVIDERS.filter((p) => p.type === "model");

export function getProviderById(id: string): AIProviderConfig | undefined {
  return AI_PROVIDERS.find((p) => p.id === id);
}
