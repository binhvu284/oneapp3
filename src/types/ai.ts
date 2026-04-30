export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface AIAgent {
  id: string;
  name: string;
  modelVersion: string;
  type: "agent" | "model";
  icon: React.ReactNode;
}

export interface AIConversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  agentId: string;
  agentName: string;
}

export type AIProviderId =
  | "github"
  | "gemini"
  | "chatgpt"
  | "claude"
  | "perplexity"
  | "grok"
  | "deepseek"
  | "groq"
  | "exa";
