import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, Check, X, Plus, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChatMessage } from "@/components/ai/ChatMessage";
import { ChatInputArea } from "@/components/ai/ChatInputArea";
import { useAIModelConnection } from "@/hooks/useAIModelConnection";
import { useAIChat } from "@/hooks/useAIChat";
import { AI_PROVIDERS } from "@/config/aiProviders";
import type { AIAgent } from "@/types/ai";

export default function AIPopup() {
  const [message, setMessage] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const { connections, enabled, githubActiveModel } = useAIModelConnection();
  const {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    thinkHarder,
    setThinkHarder,
  } = useAIChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages.length, scrollToBottom]);

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

  useEffect(() => {
    if (!selectedAgent && availableAgents.length > 0) setSelectedAgent(availableAgents[0]);
  }, [availableAgents, selectedAgent]);

  const handleSend = () => {
    if (!message.trim() || !selectedAgent || isLoading) return;
    sendMessage(message, selectedAgent);
    setMessage("");
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="h-full min-h-0 flex flex-col max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-2 pb-2 border-b border-border/50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 text-muted-foreground h-9">
              {selectedAgent ? (
                <div className="flex items-center gap-2">
                  {selectedAgent.icon}
                  <span className="text-sm">{selectedAgent.name}</span>
                  {thinkHarder && <Sparkles className="w-3 h-3 text-primary" />}
                </div>
              ) : "Select model..."}
              <ChevronDown className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {availableAgents.length > 0 ? (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground">Available Models</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availableAgents.map(agent => (
                  <DropdownMenuItem key={agent.id} onClick={() => setSelectedAgent(agent)} className="flex items-center gap-2">
                    <span className="flex-shrink-0">{agent.icon}</span>
                    <span className="truncate flex-1">{agent.name}</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">{agent.modelVersion}</span>
                    <Check className={`w-3 h-3 flex-shrink-0 ml-auto ${selectedAgent?.id === agent.id ? "opacity-100" : "opacity-0"}`} />
                  </DropdownMenuItem>
                ))}
              </>
            ) : (
              <DropdownMenuItem disabled>No models connected</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-1">
          {hasMessages && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearMessages} title="New chat">
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      {!hasMessages ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            {selectedAgent?.icon ?? <Sparkles className="w-6 h-6 text-primary" />}
          </div>
          <div>
            <p className="font-semibold text-foreground">Quick AI Chat</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {selectedAgent
                ? `Ask ${selectedAgent.name} anything`
                : "Connect an AI model in OneApp AI settings"}
            </p>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 py-4 max-w-full">
            {messages.map((msg, index) => {
              const isLastAssistant = msg.role === "assistant" && index === messages.length - 1;
              return (
                <ChatMessage
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  agentIcon={selectedAgent?.icon}
                  isStreaming={isLoading && isLastAssistant}
                />
              );
            })}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex items-center gap-3 animate-fade-in">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-muted">
                  {selectedAgent?.icon}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      )}

      {/* Input */}
      <ChatInputArea
        message={message}
        onMessageChange={setMessage}
        onSend={handleSend}
        disabled={!selectedAgent || isLoading}
        isLoading={isLoading}
        placeholder={selectedAgent ? `Ask ${selectedAgent.name}...` : "Select a model to start..."}
        thinkHarder={thinkHarder}
        onThinkHarderChange={setThinkHarder}
      />
    </div>
  );
}
