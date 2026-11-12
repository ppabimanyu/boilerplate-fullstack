import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useHealth } from "@/hooks/use-health";
import { cn } from "@/lib/utils";

type HealthState = "checking" | "operational" | "degraded";

const healthStates: Record<
  HealthState,
  { label: string; dotClassName: string; description: string }
> = {
  checking: {
    label: "Checking",
    dotClassName: "bg-muted-foreground",
    description: "Contacting the backend.",
  },
  operational: {
    label: "Operational",
    dotClassName: "bg-emerald-500",
    description: "All dependencies are responding.",
  },
  degraded: {
    label: "Degraded",
    dotClassName: "bg-red-500",
    description: "One or more dependencies are unavailable.",
  },
};

export function HealthStatus() {
  const { data, isError, isFetching, isPending, refetch } = useHealth();

  const state: HealthState = isPending
    ? "checking"
    : isError || data?.status !== "ok"
      ? "degraded"
      : "operational";

  const { label, dotClassName, description } = healthStates[state];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className={cn("size-2.5 rounded-full", dotClassName)} aria-hidden="true" />
          {label}
        </CardTitle>
        <CardDescription>Backend readiness</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
          <RefreshCw className={isFetching ? "animate-spin" : undefined} />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}
