import { Badge } from "@/components/ui/badge";

const VIOLATION_CLASSES: Record<string, string> = {
  rate_limit: "bg-red-50 text-red-700 border-red-200",
  llm_judge: "bg-red-50 text-red-700 border-red-200",
  input: "bg-amber-50 text-amber-700 border-amber-200",
  encoding: "bg-amber-50 text-amber-700 border-amber-200",
  tool_call: "bg-amber-50 text-amber-700 border-amber-200",
};

interface ViolationBadgeProps {
  type: string;
}

export function ViolationBadge({ type }: ViolationBadgeProps) {
  const classes = VIOLATION_CLASSES[type] ?? "bg-zinc-100 text-zinc-600 border-zinc-200";
  return (
    <Badge variant="outline" className={classes}>
      {type}
    </Badge>
  );
}

export default ViolationBadge;
