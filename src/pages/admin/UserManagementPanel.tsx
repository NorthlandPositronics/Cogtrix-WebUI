import { useState, type FormEvent } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, MoreHorizontal, Users, AlertTriangle, Loader2 } from "lucide-react";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/keys";
import type { UserOut, UserCreateRequest, UserUpdateRequest } from "@/lib/api/types";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useUsersQuery } from "@/hooks/admin/useUsersQuery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ConfirmDialog";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString();
}

interface RoleBadgeProps {
  role: "user" | "admin";
}

function RoleBadge({ role }: RoleBadgeProps) {
  if (role === "admin") {
    return (
      <Badge className="border-teal-200 bg-teal-50 text-teal-700" variant="outline">
        admin
      </Badge>
    );
  }
  return <Badge variant="outline">user</Badge>;
}

interface CreateUserDialogProps {
  onCreated: () => void;
}

function CreateUserDialog({ onCreated }: CreateUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");

  const createMutation = useMutation({
    mutationFn: (body: UserCreateRequest) => api.post<UserOut>("/users", body),
    onSuccess: () => {
      toast.success("User created");
      onCreated();
      handleClose(false);
    },
    onError: () => {
      toast.error("Failed to create user");
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    createMutation.mutate({ username: username.trim(), email: email.trim(), password, role });
  }

  function handleClose(next: boolean) {
    if (!next) {
      setOpen(false);
      setUsername("");
      setEmail("");
      setPassword("");
      setRole("user");
    } else {
      setOpen(true);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5" data-cy="create-user-button">
          <Plus className="h-4 w-4" />
          Create user
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create user</DialogTitle>
          <DialogDescription>Add a new user account to the system.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="user-username">Username</Label>
            <Input
              id="user-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
              required
              autoComplete="username"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="user-email">Email</Label>
            <Input
              id="user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="user-password">Password</Label>
            <Input
              id="user-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="user-role">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as "user" | "admin")}>
              <SelectTrigger id="user-role" className="min-h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">user</SelectItem>
                <SelectItem value="admin">admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={createMutation.isPending}
              data-cy="cancel-create-user"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || !username.trim() || !email.trim() || !password}
              data-cy="confirm-create-user"
            >
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface UserRowActionsProps {
  user: UserOut;
  isSelf: boolean;
  onRoleChange: (id: string, body: UserUpdateRequest) => void;
  onDelete: (user: UserOut) => void;
  isRolePending: boolean;
}

function UserRowActions({
  user,
  isSelf,
  onRoleChange,
  onDelete,
  isRolePending,
}: UserRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="min-h-11 min-w-11 p-0 text-zinc-500"
          aria-label={`Actions for ${user.username}`}
          disabled={isRolePending}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {user.role === "user" ? (
          <DropdownMenuItem
            onSelect={() => onRoleChange(user.id, { role: "admin" })}
            data-cy={`make-admin-${user.id}`}
          >
            Make admin
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onSelect={() => onRoleChange(user.id, { role: "user" })}
            disabled={isSelf}
            data-cy={`make-user-${user.id}`}
          >
            Make user
          </DropdownMenuItem>
        )}
        {!isSelf && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => onDelete(user)}
              className="text-red-600 focus:bg-red-50 focus:text-red-700"
              data-cy={`delete-user-${user.id}`}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UserManagementPanel() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const [deleteTarget, setDeleteTarget] = useState<UserOut | null>(null);

  const { data: users, isLoading, isError, refetch } = useUsersQuery();

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UserUpdateRequest }) =>
      api.patch<UserOut>(`/users/${id}`, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.users.all });
      toast.success("Role updated");
    },
    onError: () => {
      toast.error("Failed to update role");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete<null>(`/users/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.users.all });
      toast.success("User deleted");
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error("Failed to delete user");
    },
  });

  function handleCreated() {
    void queryClient.invalidateQueries({ queryKey: keys.users.all });
  }

  function handleRoleChange(id: string, body: UserUpdateRequest) {
    updateRoleMutation.mutate({ id, body });
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <AlertTriangle className="h-12 w-12 text-red-600" strokeWidth={1.5} />
        <p className="text-sm text-red-600">Failed to load users.</p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateUserDialog onCreated={handleCreated} />
      </div>

      {!users?.length ? (
        <div className="rounded-xl border border-zinc-200 py-16 text-center">
          <Users className="mx-auto mb-3 h-12 w-12 text-zinc-400" strokeWidth={1.5} />
          <p className="text-sm text-zinc-500">No users found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Username
                </TableHead>
                <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Email
                </TableHead>
                <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Role
                </TableHead>
                <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Created
                </TableHead>
                <TableHead className="text-right text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-zinc-50">
                  <TableCell className="font-medium text-zinc-900">{user.username}</TableCell>
                  <TableCell className="text-sm text-zinc-600">{user.email}</TableCell>
                  <TableCell>
                    <RoleBadge role={user.role} />
                  </TableCell>
                  <TableCell className="text-sm text-zinc-500">
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <UserRowActions
                      user={user}
                      isSelf={user.id === currentUser?.id}
                      onRoleChange={handleRoleChange}
                      onDelete={setDeleteTarget}
                      isRolePending={updateRoleMutation.isPending}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete user"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.username}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        variant="destructive"
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
      />
    </div>
  );
}

export default UserManagementPanel;
