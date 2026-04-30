import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource as useAuth } from "@/hooks/useAuthSource";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AIMessage, AIAgent, AIConversation } from "@/types/ai";

// Re-export under shorter aliases used internally
type Message = AIMessage;
type Agent = AIAgent;
type Conversation = AIConversation;

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

export function useAIChat() {
  const { user, oneappToken } = useAuth();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [thinkHarder, setThinkHarder] = useState(false);

  // 1. Fetch Conversations
  const { data: conversations = [], isLoading: isLoadingConversations } = useQuery({
    queryKey: ["ai_conversations", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", user?.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((conv) => ({
        id: conv.id,
        title: conv.title || "New Conversation",
        lastMessage: conv.last_message || "",
        timestamp: new Date(conv.updated_at),
        agentId: conv.agent_id,
        agentName: conv.agent_name,
      })) as Conversation[];
    },
    enabled: !!user,
  });

  // 2. Fetch Messages for Current Conv
  const { data: fetchedMessages, isFetching: isFetchingMessages } = useQuery({
    queryKey: ["ai_messages", currentConversationId],
    queryFn: async () => {
      if (!currentConversationId) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", currentConversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      return (data || []).map((msg) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        timestamp: new Date(msg.created_at),
      }));
    },
    enabled: !!currentConversationId,
  });

  // Sync fetched array to local state
  useEffect(() => {
    if (fetchedMessages) {
      setMessages(fetchedMessages);
    }
  }, [fetchedMessages]);

  const loadConversation = useCallback((conversationId: string) => {
    setCurrentConversationId(conversationId);
  }, []);

  const createConversation = async (agent: Agent, firstMessage: string): Promise<string | null> => {
    if (!user) return null;
    try {
      const title = firstMessage.length > 50 ? firstMessage.substring(0, 50) + "..." : firstMessage;
      const { data, error } = await supabase
        .from("conversations")
        .insert({ title, agent_id: agent.id, agent_name: agent.name, last_message: firstMessage, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      // Optimistic update
      queryClient.setQueryData(["ai_conversations", user.id], (old: any) => {
        const newConv: Conversation = {
          id: data.id,
          title: data.title || "New Conversation",
          lastMessage: data.last_message || "",
          timestamp: new Date(data.updated_at),
          agentId: data.agent_id,
          agentName: data.agent_name,
        };
        return [newConv, ...(old || [])];
      });

      setCurrentConversationId(data.id);
      return data.id;
    } catch (error) {
      console.error("Failed to create conversation:", error);
      return null;
    }
  };

  const saveMessage = async (conversationId: string, role: "user" | "assistant", content: string) => {
    try {
      const { error } = await supabase.from("messages").insert({ conversation_id: conversationId, role, content });
      if (error) throw error;

      await supabase
        .from("conversations")
        .update({ last_message: content.substring(0, 100), updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      queryClient.invalidateQueries({ queryKey: ["ai_conversations", user?.id] });
    } catch (error) {
      console.error("Failed to save message:", error);
    }
  };

  const renameMutation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { error } = await supabase.from("conversations").update({ title }).eq("id", id);
      if (error) throw error;
      return { id, title };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai_conversations", user?.id] });
    },
    onError: () => toast.error("Failed to rename conversation"),
  });

  const renameConversation = (conversationId: string, newTitle: string) => {
    renameMutation.mutate({ id: conversationId, title: newTitle });
  };

  const getProviderFromAgentId = (agentId: string): "github" | "gemini" | "chatgpt" | "claude" | "perplexity" | "grok" | "deepseek" | "groq" | "exa" => {
    if (agentId === "github") return "github";
    if (agentId === "gemini") return "gemini";
    if (agentId === "chatgpt") return "chatgpt";
    if (agentId === "claude") return "claude";
    if (agentId === "perplexity") return "perplexity";
    if (agentId === "grok") return "grok";
    if (agentId === "deepseek") return "deepseek";
    if (agentId === "groq") return "groq";
    if (agentId === "exa") return "exa";
    return "gemini"; // fallback
  };

  const sendMessage = useCallback(async (content: string, agent: Agent) => {
    if (!content.trim() || !agent) return;

    // Always use OneApp token for authentication
    const token = oneappToken;

    if (!token) {
      toast.error("Please sign in to send messages");
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    let assistantContent = "";
    const assistantId = crypto.randomUUID();

    let convId = currentConversationId;
    if (!convId) {
      convId = await createConversation(agent, content.trim());
      if (!convId) {
        toast.error("Failed to create conversation");
        setIsLoading(false);
        return;
      }
    }

    await saveMessage(convId, "user", content.trim());

    const upsertAssistant = (nextChunk: string) => {
      assistantContent += nextChunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last.id === assistantId) {
          return prev.map((m) =>
            m.id === assistantId ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, {
          id: assistantId,
          role: "assistant" as const,
          content: assistantContent,
          timestamp: new Date(),
        }];
      });
    };

    try {
      const provider = getProviderFromAgentId(agent.id);

      const messagesToSend = messages
        .filter(m => m.role === "user" || m.role === "assistant")
        .map(m => ({ role: m.role, content: m.content }));

      messagesToSend.push({ role: "user", content: content.trim() });

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: messagesToSend,
          provider,
          thinkHarder,
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        const errorMessage = errorData.error || `Error: ${resp.status}`;
        throw new Error(errorMessage);
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            // Ignore
          }
        }
      }

      if (assistantContent && convId) {
        await saveMessage(convId, "assistant", assistantContent);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send message");
      if (!assistantContent) {
        setMessages(prev => prev.filter(m => m.id !== userMessage.id));
      }
    } finally {
      setIsLoading(false);
    }
  }, [messages, currentConversationId, oneappToken, thinkHarder]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentConversationId(null);
  }, []);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("conversations").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["ai_conversations", user?.id] });
      if (currentConversationId === id) clearMessages();
    },
    onError: () => toast.error("Failed to delete conversation"),
  });

  const deleteConversation = (conversationId: string) => {
    deleteMutation.mutate(conversationId);
  };

  return {
    messages,
    isLoading: isLoading || isFetchingMessages,
    sendMessage,
    clearMessages,
    conversations,
    isLoadingConversations,
    loadConversation,
    deleteConversation,
    renameConversation,
    currentConversationId,
    thinkHarder,
    setThinkHarder,
  };
}
