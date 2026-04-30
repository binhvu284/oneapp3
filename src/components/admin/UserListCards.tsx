import { Search, Eye, Trash2, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import type { OneAppUser } from "@/hooks/useAdminUsers";

interface UserListCardsProps {
  users: OneAppUser[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onViewUser: (user: OneAppUser) => void;
  onDeleteUser: (user: OneAppUser) => void;
}

export function UserListCards({ users, loading, searchTerm, onSearchChange, onViewUser, onDeleteUser }: UserListCardsProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search users..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className="pl-9 h-9 text-sm" />
      </div>

      {loading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-3"><div className="flex items-center gap-3"><Skeleton className="w-10 h-10 rounded-full" /><div className="flex-1"><Skeleton className="h-4 w-32 mb-1" /><Skeleton className="h-3 w-48" /></div></div></Card>
        ))
      ) : users.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground text-sm">No users found</Card>
      ) : (
        users.map((user) => (
          <Card key={user.id} className="p-3 cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => onViewUser(user)}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback className="text-sm bg-primary/20 text-primary">
                    {(user.display_name || user.name || user.email).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${user.is_active ? "bg-emerald-500" : "bg-red-500"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user.display_name || user.name || user.email}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewUser(user); }}>
                    <Eye className="w-4 h-4 mr-2" /> View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDeleteUser(user); }} className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
