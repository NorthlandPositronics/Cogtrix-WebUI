import { lazy, Suspense } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { PageHeader } from "@/components/PageHeader";
import { PageSkeleton } from "@/components/PageSkeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SystemInfoCard = lazy(() => import("./SystemInfoCard"));
const LiveLogViewer = lazy(() => import("./LiveLogViewer"));
const UserManagementPanel = lazy(() => import("./UserManagementPanel"));

export function AdminPage() {
  const isAdmin = useAuthStore((s) => s.isAdmin);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <PageHeader title="Administration" />

        <Tabs defaultValue="system">
          <div className="overflow-x-auto pb-2">
            <TabsList className="w-max min-w-full justify-start">
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="live-logs">Live Logs</TabsTrigger>
              {isAdmin && <TabsTrigger value="users">Users</TabsTrigger>}
            </TabsList>
          </div>

          <TabsContent value="system" className="mt-4">
            <Suspense fallback={<PageSkeleton />}>
              <SystemInfoCard />
            </Suspense>
          </TabsContent>

          <TabsContent value="live-logs" className="mt-4">
            <Suspense fallback={<PageSkeleton />}>
              <LiveLogViewer />
            </Suspense>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="users" className="mt-4">
              <Suspense fallback={<PageSkeleton />}>
                <UserManagementPanel />
              </Suspense>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

export default AdminPage;
