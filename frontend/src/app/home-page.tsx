import { Activity, Database, Monitor, Server } from "lucide-react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

import { SheetCorners } from "@/brand/sheet-corners";
import { ServiceChart } from "@/brand/service-chart";
import { HealthStatus } from "@/components/shared/health-status";

const stack = [
  {
    layer: "Backend",
    icon: Server,
    items: "Go 1.27, chi, pgx, sqlc, goose",
  },
  {
    layer: "Frontend",
    icon: Monitor,
    items: "React 19, Vite, Tailwind CSS v4, shadcn/ui",
  },
  {
    layer: "Data",
    icon: Database,
    items: "PostgreSQL, Redis, TanStack Query, openapi-fetch",
  },
  {
    layer: "Operations",
    icon: Activity,
    items: "OpenTelemetry, Docker Compose, GitHub Actions",
  },
];

const absent = [
  {
    item: "Authentication",
    reason: "Bring the provider your project already trusts, and wire it in one place.",
  },
  {
    item: "Roles and permissions",
    reason: "Authorization rules belong to your domain, not to a template.",
  },
  {
    item: "Email delivery",
    reason: "Transactional mail needs a vendor decision the template cannot make for you.",
  },
  {
    item: "Domain tables",
    reason: "The pipeline is proven with infrastructure queries, so no model is invented.",
  },
];

const steps: { title: string; body: ReactNode }[] = [
  {
    title: "Write a migration",
    body: (
      <>
        Add a goose migration under <Code>backend/db/migrations</Code>.
      </>
    ),
  },
  {
    title: "Add a query",
    body: (
      <>
        Describe it in <Code>backend/db/queries</Code>, then run <Code>make generate</Code>.
      </>
    ),
  },
  {
    title: "Build the feature",
    body: (
      <>
        Keep it in <Code>frontend/src/features</Code> with its own route and data.
      </>
    ),
  },
];

function Code({ children }: { children: ReactNode }) {
  return <code className="font-mono text-[0.85em] whitespace-nowrap">{children}</code>;
}

export function HomePage() {
  return (
    <div className="flex flex-col gap-12">
      <section className="relative px-4 py-4">
        <SheetCorners className="hidden sm:block" />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_252px] lg:items-start">
          <div className="flex flex-col gap-6">
            <h1 className="max-w-3xl text-balance text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.02] font-semibold tracking-[-0.03em]">
              A Go and React foundation for the next project.
            </h1>
            <p className="max-w-[60ch] text-base leading-relaxed text-muted-foreground">
              HTTP server, configuration, PostgreSQL, Redis, observability, typed API access, and a
              component baseline. No domain and no authentication, so nothing has to be removed
              before the first feature.
            </p>
            {import.meta.env.DEV ? (
              <Link
                to="/_gallery"
                className="w-fit text-sm font-medium text-brand underline decoration-brand/40 underline-offset-4 transition-colors hover:decoration-brand"
              >
                Browse the component gallery
              </Link>
            ) : null}
          </div>
          <ServiceChart className="w-40 lg:w-auto" />
        </div>
      </section>

      <section aria-label="Readiness" className="border-y border-border py-5">
        <HealthStatus />
      </section>

      <section className="grid gap-10 sm:grid-cols-2 sm:gap-16">
        <div>
          <h2 className="text-sm font-semibold">What's inside</h2>
          <dl className="mt-4 divide-y divide-border border-t border-border">
            {stack.map(({ layer, icon: Icon, items }) => (
              <div key={layer} className="grid grid-cols-[92px_1fr] gap-4 py-3 text-sm">
                <dt className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="size-4 shrink-0 text-brand" aria-hidden="true" />
                  {layer}
                </dt>
                <dd className="leading-relaxed">{items}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Deliberately absent</h2>
          <ul className="mt-4 divide-y divide-border border-t border-border">
            {absent.map(({ item, reason }) => (
              <li key={item} className="py-3 text-sm">
                <p className="font-medium">{item}</p>
                <p className="mt-0.5 leading-relaxed text-muted-foreground">{reason}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold">Start here</h2>
        <ol className="mt-4 grid gap-8 border-t border-border pt-6 sm:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-2">
              <span className="text-sm text-brand tabular-nums">0{index + 1}</span>
              <h3 className="text-base font-medium">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
