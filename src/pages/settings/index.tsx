import { lazy, Suspense, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ConfigFlagsForm = lazy(() => import("./ConfigFlagsForm"));
const ProviderList = lazy(() => import("./ProviderList"));
const McpServerList = lazy(() => import("./McpServerList"));
const ApiKeyList = lazy(() => import("./ApiKeyList"));
const SetupWizard = lazy(() => import("./SetupWizard"));

function TabSkeleton() {
  return (
    <div className="space-y-4 pt-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto w-full max-w-5xl">
        <PageHeader title="Settings" />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto pb-2">
            <TabsList className="w-max min-w-full justify-start">
              <TabsTrigger value="general" data-cy="tab-general">
                General
              </TabsTrigger>
              <TabsTrigger value="providers" data-cy="tab-providers">
                Providers &amp; Models
              </TabsTrigger>
              <TabsTrigger value="mcp" data-cy="tab-mcp">
                MCP Servers
              </TabsTrigger>
              <TabsTrigger value="apikeys" data-cy="tab-apikeys">
                API Keys
              </TabsTrigger>
              <TabsTrigger value="wizard" data-cy="tab-wizard">
                Setup Wizard
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="general" className="mt-4">
            <Suspense fallback={<TabSkeleton />}>
              <ConfigFlagsForm />
            </Suspense>
          </TabsContent>

          <TabsContent value="providers" className="mt-4">
            <Suspense fallback={<TabSkeleton />}>
              <ProviderList onRequestWizard={() => setActiveTab("wizard")} />
            </Suspense>
          </TabsContent>

          <TabsContent value="mcp" className="mt-4">
            <Suspense fallback={<TabSkeleton />}>
              <McpServerList />
            </Suspense>
          </TabsContent>

          <TabsContent value="apikeys" className="mt-4">
            <Suspense fallback={<TabSkeleton />}>
              <ApiKeyList />
            </Suspense>
          </TabsContent>

          <TabsContent value="wizard" className="mt-4">
            <Suspense fallback={<TabSkeleton />}>
              <SetupWizard />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default SettingsPage;
