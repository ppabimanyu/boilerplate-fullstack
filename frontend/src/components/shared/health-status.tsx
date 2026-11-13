import { RefreshCw } from "lucide-react";

import { StatusBadge, type Status } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useHealth } from "@/hooks/use-health";

type HealthState = "checking" | "operational" | "degraded";

const healthStates: Record<HealthState, { status: Status; label: string; description: string }> = {
  checking: {
    status: "pending",
    label: "Checking",
    description: "Contacting the backend.",
  },
  operational: {
    status: "success",
    label: "Operational",
    description: "All dependencies are responding.",
  },
  degraded: {
    status: "danger",
    label: "Degraded",
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

  const { status, label, description } = healthStates[state];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <StatusBadge status={status} label={label} />
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
