import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Menu, Plus, Pencil, Trash2, Check, X, MessageSquare, Search, MoreVertical, Github } from "lucide-react";
import { GeminiIcon } from "@/components/icons/GeminiIcon";
import { ChatGPTIcon } from "@/components/icons/ChatGPTIcon";
import { ClaudeIcon } from "@/components/icons/ClaudeIcon";
import { PerplexityIcon } from "@/components/icons/PerplexityIcon";
import { GrokIcon } from "@/components/icons/GrokIcon";
import { DeepSeekIcon } from "@/components/icons/DeepSeekIcon";
import { GroqIcon } from "@/components/icons/GroqIcon";
import { ExaIcon } from "@/components/icons/ExaIcon";

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  agentId: string;
  agentName: string;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getAgentIcon(agentId: string) {
  if (agentId === "github") return <Github className="w-4 h-4 text-gray-800 dark:text-gray-200" />;
  if (agentId === "gemini") return <GeminiIcon className="w-4 h-4 text-blue-500" />;
  if (agentId === "chatgpt") return <ChatGPTIcon className="w-4 h-4 text-emerald-500" />;
  if (agentId === "claude") return <ClaudeIcon className="w-4 h-4 text-amber-600" />;
  if (agentId === "perplexity") return <PerplexityIcon className="w-4 h-4 text-cyan-500" />;
  if (agentId === "grok") return <GrokIcon className="w-4 h-4 text-black dark:text-white" />;
  if (agentId === "deepseek") return <DeepSeekIcon className="w-4 h-4 text-blue-600" />;
  if (agentId === "groq") return <GroqIcon className="w-4 h-4 text-orange-500" />;
  if (agentId === "exa") return <ExaIcon className="w-4 h-4 text-purple-600" />;
  return <MessageSquare className="w-4 h-4 text-muted-foreground" />;
}

function groupConversations(conversations: Conversation[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const week = new Date(today.getTime() - 7 * 86400000);

  const groups: { label: string; items: Conversation[] }[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Previous 7 Days", items: [] },
    { label: "Older", items: [] },
  ];

  for (const conv of conversations) {
    const t = conv.timestamp;
    if (t >= today) groups[0].items.push(conv);
    else if (t >= yesterday) groups[1].items.push(conv);
    else if (t >= week) groups[2].items.push(conv);
    else groups[3].items.push(conv);
  }

  return groups.filter((g) => g.items.length > 0);
}

export function ConversationSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onRenameConversation,
  onDeleteConversation,
  open,
  onOpenChange,
}: ConversationSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(c => c.title.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q));
  }, [conversations, searchQuery]);

  const groups = useMemo(() => groupConversations(filtered), [filtered]);

  const startEdit = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const confirmEdit = () => {
    if (editingId && editTitle.trim()) {
      onRenameConversation(editingId, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 p-0 flex flex-col">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle className="text-left text-base">Conversations</SheetTitle>
        </SheetHeader>
        <div className="px-3 py-2 border-b border-border space-y-2">
          <Button size="sm" variant="outline" className="w-full h-8 gap-1.5" onClick={() => { onNewConversation(); onOpenChange(false); }}>
            <Plus className="w-3.5 h-3.5 flex-shrink-0" />
            New conversation
          </Button>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="h-8 text-xs pl-8 pr-2"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-3">
            {groups.length > 0 ? (
              groups.map((group) => (
                <div key={group.label}>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-3 py-1.5">
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((conv) => (
                      <div
                        key={conv.id}
                        className={`group relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${currentConversationId === conv.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-accent/50"
                          }`}
                        onClick={() => {
                          if (editingId !== conv.id) {
                            onSelectConversation(conv.id);
                            onOpenChange(false);
                          }
                        }}
                      >
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                          {getAgentIcon(conv.agentId)}
                        </div>
                        <div className="flex-1 min-w-0">
                          {editingId === conv.id ? (
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <Input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") confirmEdit();
                                  if (e.key === "Escape") cancelEdit();
                                }}
                                className="h-6 text-xs px-1.5"
                                autoFocus
                              />
                              <button onClick={confirmEdit} className="text-primary hover:text-primary/80">
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={cancelEdit} className="text-muted-foreground hover:text-foreground">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <p className="text-sm font-medium truncate">{conv.title}</p>
                          )}
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                            {conv.lastMessage}
                          </p>
                        </div>
                        {editingId !== conv.id && (
                          <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-1 rounded hover:bg-muted transition-colors">
                                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-36">
                                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); startEdit(conv); }} className="gap-2 text-xs cursor-pointer">
                                  <Pencil className="w-3.5 h-3.5" />
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => onDeleteConversation(conv.id)} className="gap-2 text-xs text-destructive focus:text-destructive cursor-pointer">
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No conversations yet
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
