import { lazy, Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useAssistantStatusQuery } from "@/hooks/assistant/useAssistantStatusQuery";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceControlPanel } from "./ServiceControlPanel";

const AssistantChatList = lazy(() => import("./AssistantChatList"));
const ScheduledMessageTable = lazy(() => import("./ScheduledMessageTable"));
const DeferredRecordTable = lazy(() => import("./DeferredRecordTable"));
const ContactList = lazy(() => import("./ContactList"));
const OutboundDialog = lazy(() => import("./OutboundDialog"));
const KnowledgePanel = lazy(() => import("./KnowledgePanel"));
const GuardrailsPanel = lazy(() => import("./GuardrailsPanel"));
const CampaignsPanel = lazy(() => import("./CampaignsPanel"));
const WorkflowsPanel = lazy(() => import("./WorkflowsPanel"));

function TabSkeleton() {
  return (
    <div className="space-y-2 pt-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

export function AssistantPage() {
  const { data: status } = useAssistantStatusQuery({
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      if (s === "starting" || s === "stopping") return 3_000;
      if (s === "running") return 10_000;
      return 30_000;
    },
  });
  const serviceRunning = status?.status === "running";
  const isAdmin = useAuthStore((s) => s.isAdmin);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <PageHeader title="Assistant" />
        <ServiceControlPanel />
        <Tabs defaultValue="chats">
          <div className="overflow-x-auto pb-2">
            <TabsList className="w-max min-w-full justify-start">
              <TabsTrigger value="chats" disabled={!serviceRunning} data-cy="tab-chats">
                Chats
              </TabsTrigger>
              <TabsTrigger value="scheduled" disabled={!serviceRunning} data-cy="tab-scheduled">
                Scheduled
              </TabsTrigger>
              <TabsTrigger value="deferred" disabled={!serviceRunning} data-cy="tab-deferred">
                Deferred
              </TabsTrigger>
              <TabsTrigger value="contacts" disabled={!serviceRunning} data-cy="tab-contacts">
                Contacts
              </TabsTrigger>
              <TabsTrigger value="knowledge" disabled={!serviceRunning} data-cy="tab-knowledge">
                Knowledge
              </TabsTrigger>
              <TabsTrigger value="guardrails" disabled={!serviceRunning} data-cy="tab-guardrails">
                Guardrails
              </TabsTrigger>
              <TabsTrigger value="campaigns" disabled={!serviceRunning} data-cy="tab-campaigns">
                Campaigns
              </TabsTrigger>
              <TabsTrigger value="workflows" disabled={!serviceRunning} data-cy="tab-workflows">
                Workflows
              </TabsTrigger>
            </TabsList>
          </div>
          {!serviceRunning && (
            <p className="py-8 text-center text-sm text-zinc-500">
              Start the assistant service to access these tabs.
            </p>
          )}
          <TabsContent value="chats" className="mt-4">
            <Suspense fallback={<TabSkeleton />}>
              <AssistantChatList />
            </Suspense>
          </TabsContent>
          <TabsContent value="scheduled" className="mt-4">
            <Suspense fallback={<TabSkeleton />}>
              <ScheduledMessageTable />
            </Suspense>
          </TabsContent>
          <TabsContent value="deferred" className="mt-4">
            <Suspense fallback={<TabSkeleton />}>
              <DeferredRecordTable />
            </Suspense>
          </TabsContent>
          <TabsContent value="contacts" className="mt-4">
            <Suspense fallback={<TabSkeleton />}>
              <div className="space-y-4">
                <div className="flex justify-end">
                  <OutboundDialog />
                </div>
                <ContactList />
              </div>
            </Suspense>
          </TabsContent>
          <TabsContent value="knowledge" className="mt-4">
            <Suspense fallback={<TabSkeleton />}>
              <KnowledgePanel isAdmin={isAdmin} />
            </Suspense>
          </TabsContent>
          <TabsContent value="guardrails" className="mt-4">
            <Suspense fallback={<TabSkeleton />}>
              <GuardrailsPanel />
            </Suspense>
          </TabsContent>
          <TabsContent value="campaigns" className="mt-4">
            <Suspense fallback={<TabSkeleton />}>
              <CampaignsPanel />
            </Suspense>
          </TabsContent>
          <TabsContent value="workflows" className="mt-4">
            <Suspense fallback={<TabSkeleton />}>
              <WorkflowsPanel />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default AssistantPage;
