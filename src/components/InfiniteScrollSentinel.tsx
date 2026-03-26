import { useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface InfiniteScrollSentinelProps {
  onIntersect: () => void;
  loading: boolean;
}

export function InfiniteScrollSentinel({ onIntersect, loading }: InfiniteScrollSentinelProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onIntersectRef = useRef(onIntersect);
  useEffect(() => {
    onIntersectRef.current = onIntersect;
  });

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          onIntersectRef.current();
        }
      },
      { rootMargin: "100px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sentinelRef} className="py-4">
      {loading && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      )}
    </div>
  );
}

export default InfiniteScrollSentinel;
