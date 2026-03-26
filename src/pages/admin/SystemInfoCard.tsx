import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSystemInfoQuery } from "@/hooks/admin/useSystemInfoQuery";
import { useLiveUptime } from "@/hooks/shared/useLiveUptime";

interface InfoRowProps {
  label: string;
  value: string | number;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <>
      <dt className="text-sm font-medium text-zinc-500">{label}</dt>
      <dd className="text-sm text-zinc-900">{value}</dd>
    </>
  );
}

export function SystemInfoCard() {
  const { data, isLoading, isError, refetch, dataUpdatedAt } = useSystemInfoQuery();
  const uptime = useLiveUptime(data?.uptime_s, dataUpdatedAt);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">System Information</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className={i % 2 === 0 ? "h-4 w-24" : "h-4 w-32"} />
            ))}
          </div>
        )}
        {isError && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm text-red-600">Failed to load system information.</p>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        )}
        {data && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
            <InfoRow label="Version" value={data.version} />
            <InfoRow label="API Version" value={data.api_version} />
            <InfoRow label="Uptime" value={uptime} />
            <InfoRow label="Python" value={data.python_version} />
            <InfoRow label="Platform" value={data.platform} />
            <InfoRow label="Debug" value={data.debug ? "On" : "Off"} />
            <InfoRow label="Verbose" value={data.verbose ? "On" : "Off"} />
          </dl>
        )}
      </CardContent>
    </Card>
  );
}

export default SystemInfoCard;
