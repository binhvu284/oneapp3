import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Plus, Check, Sparkles, X, Pencil, Plane, Square, Lightbulb } from "lucide-react";
import { useAIModelConnection } from "@/hooks/useAIModelConnection";
import { useAIChat } from "@/hooks/useAIChat";
import { ChatMessage } from "@/components/ai/ChatMessage";
import { ChatInputArea } from "@/components/ai/ChatInputArea";
import { ConversationSidebar } from "@/components/ai/ConversationSidebar";
import { AI_PROVIDERS, getProviderById } from "@/config/aiProviders";
import type { AIAgent } from "@/types/ai";

const quickActions = [
  { icon: <Plane className="w-5 h-5 text-blue-400" />, label: "Help me plan a trip", prompt: "Help me plan a trip to Japan for 7 days" },
  { icon: <Pencil className="w-5 h-5 text-green-400" />, label: "Explain a complex topic", prompt: "Explain quantum computing in simple terms" },
  { icon: <Square className="w-5 h-5 text-pink-400" />, label: "Write an email", prompt: "Help me write a professional email to request a meeting" },
  { icon: <Lightbulb className="w-5 h-5 text-yellow-400" />, label: "Get creative ideas", prompt: "Give me 5 creative ideas for a birthday party" },
];

type Agent = AIAgent;

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning!";
  if (h < 18) return "Good afternoon!";
  return "Good evening!";
}

export default function AIChat() {
  const [message, setMessage] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitleValue, setEditingTitleValue] = useState("");
  const { connections, enabled, githubActiveModel } = useAIModelConnection();
  const {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    conversations,
    loadConversation,
    deleteConversation,
    renameConversation,
    currentConversationId,
    thinkHarder,
    setThinkHarder,
  } = useAIChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Scroll when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  const handleSaveTitle = async () => {
    if (currentConversationId && editingTitleValue.trim()) {
      await renameConversation(currentConversationId, editingTitleValue.trim());
    }
    setIsEditingTitle(false);
  };

  const availableAgents = useMemo<Agent[]>(() => {
    return AI_PROVIDERS
      .filter((p) => connections[p.id as keyof typeof connections] && enabled[p.id as keyof typeof enabled])
      .map((p) => ({
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

  const handleQuickAction = (prompt: string) => {
    if (!selectedAgent || isLoading) return;
    sendMessage(prompt, selectedAgent);
  };

  const handleSelectConversation = (id: string) => {
    loadConversation(id);
    const conv = conversations.find(c => c.id === id);
    if (conv) {
      const agent = availableAgents.find(a => a.id === conv.agentId);
      if (agent) setSelectedAgent(agent);
    }
  };

  const hasMessages = messages.length > 0;
  const currentConv = conversations.find(c => c.id === currentConversationId);

  return (
    <div className="h-full min-h-0 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-0 pb-2 border-b border-border/50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 text-muted-foreground h-9">
              {selectedAgent ? (
                <div className="flex items-center gap-2">
                  {selectedAgent.icon}
                  <span className="text-sm">{selectedAgent.name}</span>
                  {thinkHarder && <Sparkles className="w-3 h-3 text-primary" />}
                </div>
              ) : (
                "Select model..."
              )}
              <ChevronDown className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72">
            {availableAgents.length > 0 ? (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground">Available Models</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availableAgents.map(agent => (
                  <DropdownMenuItem key={agent.id} onClick={() => setSelectedAgent(agent)} className="flex items-center gap-2">
                    <span className="flex-shrink-0">{agent.icon}</span>
                    <span className="truncate">{agent.name}</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">{agent.modelVersion}</span>
                    <Check className={`w-3 h-3 flex-shrink-0 ml-auto ${selectedAgent?.id === agent.id ? "opacity-100" : "opacity-0"}`} />
                  </DropdownMenuItem>
                ))}
              </>
            ) : (
              <DropdownMenuItem disabled>No models available</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1 flex justify-center min-w-0 px-4">
          {currentConv ? (
            isEditingTitle ? (
              <div className="flex items-center gap-1 max-w-[300px] w-full">
                <Input
                  value={editingTitleValue}
                  onChange={(e) => setEditingTitleValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveTitle();
                    if (e.key === "Escape") setIsEditingTitle(false);
                  }}
                  className="h-7 text-sm px-2"
                  autoFocus
                />
                <Button variant="ghost" size="icon" className="h-7 w-7 text-primary shrink-0" onClick={handleSaveTitle}>
                  <Check className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground shrink-0" onClick={() => setIsEditingTitle(false)}>
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1 group/title max-w-[300px]">
                <span className="text-sm font-medium text-foreground truncate">
                  {currentConv.title}
                </span>
                <button
                  onClick={() => { setIsEditingTitle(true); setEditingTitleValue(currentConv.title); }}
                  className="opacity-0 group-hover/title:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-opacity shrink-0 rounded hover:bg-muted"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
            )
          ) : (
            <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
              {hasMessages ? "Conversation" : "New Conversation"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {hasMessages && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearMessages} title="New conversation">
              <Plus className="w-4 h-4" />
            </Button>
          )}
          <ConversationSidebar
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelectConversation={handleSelectConversation}
            onNewConversation={clearMessages}
            onRenameConversation={renameConversation}
            onDeleteConversation={deleteConversation}
            open={historyOpen}
            onOpenChange={setHistoryOpen}
          />
        </div>
      </div>

      {/* Chat Content */}
      {!hasMessages ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-5">
          <div className="animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 text-center">{getGreeting()}</h1>
            <p className="text-muted-foreground mb-8 text-center">How can I help you today?</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
            {quickActions.map((action, i) => (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action.prompt)}
                disabled={!selectedAgent || isLoading}
                className="feature-card flex items-center gap-3 p-4 text-left disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/50 transition-colors animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {action.icon}
                <span className="text-sm font-medium text-foreground">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1 px-4 md:px-8 lg:px-16" ref={scrollRef}>
          <div className="space-y-6 pb-4 pt-4 max-w-3xl mx-auto">
            {messages.map((msg, index) => {
              const isLastAssistantMessage = msg.role === "assistant" && index === messages.length - 1;
              return (
                <ChatMessage
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  agentIcon={selectedAgent?.icon}
                  isStreaming={isLoading && isLastAssistantMessage}
                />
              );
            })}
            {/* Thinking indicator */}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex items-center gap-3 animate-fade-in">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-muted">
                  {selectedAgent?.icon}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:300ms]" />
                  <span className="text-xs text-muted-foreground ml-1">
                    {thinkHarder ? "Thinking harder..." : "Thinking..."}
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      )}

      {/* Input Area */}
      <ChatInputArea
        message={message}
        onMessageChange={setMessage}
        onSend={handleSend}
        disabled={!selectedAgent || isLoading}
        isLoading={isLoading}
        placeholder={selectedAgent ? `Message ${selectedAgent.name}...` : "Select a model to start chatting..."}
        thinkHarder={thinkHarder}
        onThinkHarderChange={setThinkHarder}
      />
    </div>
  );
}
