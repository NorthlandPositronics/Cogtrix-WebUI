import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";
import { SidebarLogo } from "@/components/SidebarLogo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface MobileHeaderProps {
  usernameInitial: string;
  onMenuClick: () => void;
}

function MobileHeader({ usernameInitial, onMenuClick }: MobileHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="h-11 w-11 text-zinc-500 hover:bg-zinc-100"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex items-center gap-2">
        <SidebarLogo className="h-[22px] w-[22px]" />
        <span className="text-base font-semibold text-zinc-900">Cogtrix</span>
      </div>
      <Avatar className="h-8 w-8" aria-hidden="true">
        <AvatarFallback className="bg-teal-50 text-xs font-semibold text-teal-700">
          {usernameInitial}
        </AvatarFallback>
      </Avatar>
    </header>
  );
}

export function AppShell() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebarCollapsed = useUIStore((s) => s.toggleSidebarCollapsed);

  const usernameInitial = user?.username.charAt(0).toUpperCase() ?? "?";

  async function handleSignOut() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar — always visible on lg+, collapsible to 48px icon rail */}
      <aside
        className={cn(
          "bg-sidebar hidden shrink-0 flex-col border-r border-zinc-200 transition-[width] duration-200 ease-in-out lg:flex",
          sidebarCollapsed ? "w-12" : "w-[220px]",
        )}
        aria-label="Application sidebar"
      >
        <Sidebar
          user={user}
          isAdmin={isAdmin}
          onSignOut={handleSignOut}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={toggleSidebarCollapsed}
        />
      </aside>

      {/* Mobile sidebar — Sheet slides in from left */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="left"
          className="bg-sidebar w-[220px] p-0 [&>[data-slot=sheet-close]]:hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>Navigation menu</SheetDescription>
          </SheetHeader>
          <Sidebar
            user={user}
            isAdmin={isAdmin}
            onSignOut={handleSignOut}
            onNavigate={() => setMobileMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Right side: mobile header + main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileHeader
          usernameInitial={usernameInitial}
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        <main className="flex flex-1 flex-col overflow-hidden bg-white" aria-label="Main content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppShell;
