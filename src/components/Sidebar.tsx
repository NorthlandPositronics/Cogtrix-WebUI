import type { ComponentType } from "react";
import { NavLink } from "react-router-dom";
import {
  MessageSquare,
  FileText,
  Bot,
  Settings,
  Shield,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { SidebarLogo } from "./SidebarLogo";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NavItem {
  to: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
}

const navItems: NavItem[] = [
  { to: "/sessions", icon: MessageSquare, label: "Sessions" },
  { to: "/documents", icon: FileText, label: "Documents" },
  { to: "/assistant", icon: Bot, label: "Assistant" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

interface SidebarProps {
  user: { username: string; role: string } | null;
  isAdmin: boolean;
  onSignOut: () => void;
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export function Sidebar({
  user,
  isAdmin,
  onSignOut,
  onNavigate,
  collapsed = false,
  onToggleCollapsed,
}: SidebarProps) {
  const usernameInitial = user?.username.charAt(0).toUpperCase() ?? "?";

  const allNavItems = [
    ...navItems,
    ...(isAdmin ? [{ to: "/admin", icon: Shield, label: "Admin" }] : []),
  ];

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-full flex-col overflow-hidden">
        {/* Logo bar */}
        <div className="flex h-14 shrink-0 items-center justify-between px-2">
          <div
            className={cn(
              "flex min-w-0 items-center gap-2 pl-2 transition-opacity duration-150",
              collapsed && "opacity-0",
            )}
            aria-hidden={collapsed}
          >
            <SidebarLogo className="h-[22px] w-[22px] shrink-0" />
            <span className="truncate text-lg font-semibold text-zinc-900">Cogtrix</span>
          </div>
          {onToggleCollapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleCollapsed}
                  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                  className={cn(
                    "h-11 w-11 shrink-0 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
                    collapsed && "mx-auto",
                  )}
                >
                  {collapsed ? (
                    <PanelLeftOpen className="h-5 w-5" />
                  ) : (
                    <PanelLeftClose className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {collapsed ? "Expand sidebar" : "Collapse sidebar"}
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <Separator />

        {/* Nav items */}
        <nav className="flex-1 space-y-1 overflow-hidden px-2 py-2" aria-label="Main navigation">
          {allNavItems.map(({ to, icon: Icon, label }) => (
            <Tooltip key={to}>
              <TooltipTrigger asChild>
                <NavLink
                  to={to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "focus-visible:ring-ring relative flex w-full items-center gap-3 overflow-hidden rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                      collapsed && "justify-center px-0",
                      isActive
                        ? "bg-teal-50 text-teal-600"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span
                          className="absolute top-0 left-0 h-full w-0.5 rounded-r-full bg-teal-600"
                          aria-hidden="true"
                        />
                      )}
                      <Icon className={cn("h-4 w-4 shrink-0", !isActive && "text-zinc-400")} />
                      <span
                        className={cn(
                          "truncate transition-[opacity,max-width] duration-150",
                          collapsed ? "max-w-0 opacity-0" : "max-w-full opacity-100",
                        )}
                        aria-hidden={collapsed}
                      >
                        {label}
                      </span>
                    </>
                  )}
                </NavLink>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">{label}</TooltipContent>}
            </Tooltip>
          ))}
        </nav>

        <Separator />

        {/* Footer */}
        <div className="flex h-[68px] shrink-0 items-center gap-2 px-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="h-8 w-8 shrink-0 cursor-default">
                <AvatarFallback className="bg-teal-50 text-xs font-semibold text-teal-700">
                  {usernameInitial}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">{user?.username ?? ""}</TooltipContent>}
          </Tooltip>
          <div
            className={cn(
              "min-w-0 flex-1 transition-[opacity,max-width] duration-150",
              collapsed ? "max-w-0 overflow-hidden opacity-0" : "max-w-full opacity-100",
            )}
            aria-hidden={collapsed}
          >
            <p className="truncate text-sm font-medium text-zinc-900">{user?.username ?? ""}</p>
            <Badge
              variant="outline"
              className={cn(
                "mt-0.5 rounded-full px-1.5 py-0 text-xs text-zinc-600",
                isAdmin && "border-teal-200 bg-teal-50 text-teal-700",
              )}
            >
              {user?.role ?? "user"}
            </Badge>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                data-cy="sign-out"
                variant="ghost"
                size="icon"
                onClick={onSignOut}
                aria-label="Sign out"
                className={cn(
                  "h-11 w-11 shrink-0 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
                  collapsed && "mx-auto",
                )}
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">Sign out</TooltipContent>}
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default Sidebar;
