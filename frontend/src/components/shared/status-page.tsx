import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type StatusPageProps = {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  detail?: ReactNode;
  actions?: ReactNode;
};

/**
 * Full-page card for states that replace the whole application: a render
 * failure, a maintenance window, or a route error response.
 */
export function StatusPage({ icon, title, description, detail, actions }: StatusPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
      <Card className="w-full max-w-md">
        <CardHeader>
          {icon ? (
            <div className="mb-2 flex size-10 items-center justify-center rounded-md border border-border text-muted-foreground">
              {icon}
            </div>
          ) : null}
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {detail}
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </CardContent>
      </Card>
    </div>
  );
}
