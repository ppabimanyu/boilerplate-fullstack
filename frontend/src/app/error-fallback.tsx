import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ErrorFallbackProps = {
  title?: ReactNode;
  description?: ReactNode;
  detail?: ReactNode;
  actions?: ReactNode;
};

/**
 * Full-page failure card shared by the route error element and the boundary
 * above the router. Actions are passed in because the boundary renders outside
 * the router and cannot use router links.
 */
export function ErrorFallback({
  title = "Something went wrong",
  description = "The page could not be rendered. Reloading usually fixes it.",
  detail,
  actions,
}: ErrorFallbackProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {detail}
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </CardContent>
      </Card>
    </div>
  );
}
