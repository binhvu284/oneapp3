import { useState } from "react";
import { Search, Eye, Trash2, MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import type { OneAppUser } from "@/hooks/useAdminUsers";

interface UserListTableProps {
  users: OneAppUser[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onViewUser: (user: OneAppUser) => void;
  onDeleteUser: (user: OneAppUser) => void;
  levelTitle: string;
}

function getStatusColor(active: boolean) {
  return active ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-red-500/20 text-red-400 border-red-500/30";
}

function getLevelBadge(level: number) {
  const map: Record<number, { label: string; cls: string }> = {
    1: { label: "Admin", cls: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
    2: { label: "Developer", cls: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
    3: { label: "Partner", cls: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    4: { label: "Customer", cls: "bg-gray-500/20 text-gray-300 border-gray-500/30" },
  };
  const m = map[level] || { label: "Unknown", cls: "" };
  return <Badge variant="outline" className={`text-[10px] ${m.cls}`}>{m.label}</Badge>;
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function UserListTable({ users, loading, searchTerm, onSearchChange, onViewUser, onDeleteUser, levelTitle }: UserListTableProps) {
  const [sortBy, setSortBy] = useState<"name" | "email" | "created">("created");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir("asc"); }
  };

  const sorted = [...users].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortBy === "name") return (a.display_name || a.name || "").localeCompare(b.display_name || b.name || "") * dir;
    if (sortBy === "email") return a.email.localeCompare(b.email) * dir;
    return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${levelTitle.toLowerCase()}s...`}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Badge variant="outline" className="text-xs">{users.length} users</Badge>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[280px]">
                <Button variant="ghost" size="sm" className="gap-1 -ml-2 text-xs" onClick={() => toggleSort("name")}>
                  User <ArrowUpDown className="w-3 h-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="gap-1 -ml-2 text-xs" onClick={() => toggleSort("email")}>
                  Email <ArrowUpDown className="w-3 h-3" />
                </Button>
              </TableHead>
              <TableHead className="w-[100px]">Level</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="gap-1 -ml-2 text-xs" onClick={() => toggleSort("created")}>
                  Last Login <ArrowUpDown className="w-3 h-3" />
                </Button>
              </TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="flex items-center gap-3"><Skeleton className="w-8 h-8 rounded-full" /><Skeleton className="h-4 w-32" /></div></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No users found</TableCell>
              </TableRow>
            ) : (
              sorted.map((user) => (
                <TableRow key={user.id} className="cursor-pointer hover:bg-muted/20" onClick={() => onViewUser(user)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="text-xs bg-primary/20 text-primary">
                          {(user.display_name || user.name || user.email).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{user.display_name || user.name || user.email}</p>
                        {user.nickname && <p className="text-xs text-muted-foreground">@{user.nickname}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                  <TableCell>{getLevelBadge(user.level)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] ${getStatusColor(user.is_active)}`}>
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(user.last_login_at)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewUser(user); }}>
                          <Eye className="w-4 h-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDeleteUser(user); }} className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
