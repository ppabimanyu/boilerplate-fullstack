import { HealthStatus } from "@/components/shared/health-status";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stack = [
  "React 19",
  "Vite",
  "TypeScript",
  "Tailwind CSS v4",
  "shadcn/ui",
  "React Router v7",
  "TanStack Query v5",
  "openapi-fetch",
];

export function HomePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Boilerplate"
        description="A general-purpose foundation for React applications, wired with typed API access and server state management."
      />

      <HealthStatus />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stack</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            {stack.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
