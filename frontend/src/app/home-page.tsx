import { HealthStatus } from "@/components/shared/health-status";
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
      <section className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Boilerplate</h1>
        <p className="max-w-2xl text-muted-foreground">
          A general-purpose foundation for React applications, wired with typed API access and
          server state management.
        </p>
      </section>

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
