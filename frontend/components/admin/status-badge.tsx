import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  submitted: "Soumise",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const submitted = status === "submitted";
  return (
    <Badge
      variant={submitted ? "default" : "secondary"}
      className={cn(!submitted && "text-muted-foreground", className)}
    >
      {STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
