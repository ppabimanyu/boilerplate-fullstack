import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { DataState } from "@/components/shared/data-state";
import { FormField } from "@/components/shared/form-field";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  name: z.string().min(2, "Enter at least 2 characters."),
  message: z.string().min(10, "Enter at least 10 characters."),
});

type FormValues = z.infer<typeof formSchema>;

const dataStateError = new Error("The projects service did not respond.");

export function GalleryPage() {
  const [dataStatus, setDataStatus] = useState<"error" | "ready">("error");
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", message: "" },
  });

  function handleSubmit(values: FormValues) {
    toast.success("Form submitted", { description: `Thanks, ${values.name}.` });
    form.reset();
  }

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Component gallery"
        description="Dev-only examples for the shared components. This route is not part of the production build."
      />

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-medium">Data state</h2>
          <p className="text-sm text-muted-foreground">
            One component, four mutually exclusive states.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium">Loading</h3>
            <DataState status="loading" />
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium">Empty</h3>
            <DataState
              status="empty"
              title="No projects yet"
              description="Create a project to see it here."
              action={
                <Button type="button" size="sm" onClick={() => toast("This is a gallery example.")}>
                  New project
                </Button>
              }
            />
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium">Error</h3>
            {dataStatus === "error" ? (
              <DataState
                status="error"
                error={dataStateError}
                onRetry={() => setDataStatus("ready")}
              />
            ) : (
              <DataState status="ready">
                <div className="rounded-2xl border bg-card p-4 text-sm">
                  <p className="font-medium">The service is back</p>
                  <p className="text-muted-foreground">The retry action switched this example.</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setDataStatus("error")}
                  >
                    Show error again
                  </Button>
                </div>
              </DataState>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium">Ready</h3>
            <DataState status="ready">
              <div className="rounded-2xl border bg-card p-4 text-sm">
                <p className="font-medium">3 projects</p>
                <p className="text-muted-foreground">Ready content renders as children.</p>
              </div>
            </DataState>
          </div>
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-medium">Form field</h2>
          <p className="text-sm text-muted-foreground">
            React Hook Form and Zod, with label, description, and error wiring.
          </p>
        </div>
        <form className="flex max-w-md flex-col gap-6" onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup>
            <FormField
              control={form.control}
              name="name"
              label="Name"
              description="Shown on the submitted message."
              render={({ field, id, describedBy, invalid }) => (
                <Input
                  {...field}
                  id={id}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  placeholder="Ada Lovelace"
                />
              )}
            />
            <FormField
              control={form.control}
              name="message"
              label="Message"
              description="At least 10 characters."
              render={({ field, id, describedBy, invalid }) => (
                <Textarea
                  {...field}
                  id={id}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  placeholder="What should we build next?"
                />
              )}
            />
          </FieldGroup>
          <div className="flex items-center gap-2">
            <Button type="submit">Submit</Button>
            <Button type="button" variant="ghost" onClick={() => form.reset()}>
              Reset
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
