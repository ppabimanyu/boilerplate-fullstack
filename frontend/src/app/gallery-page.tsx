import { PageHeader } from "@/components/shared/page-header";
import { Separator } from "@/components/ui/separator";
import { DataStateSection } from "./_gallery/data-state-section";
import { DisplaySection } from "./_gallery/display-section";
import { FormFieldSection } from "./_gallery/form-field-section";
import { OverlaySection } from "./_gallery/overlay-section";
import { SelectionSection } from "./_gallery/selection-section";

export function GalleryPage() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Component gallery"
        description="Dev-only examples for the primitives and shared components. This route is not part of the production build."
      />

      <DataStateSection />
      <Separator />
      <FormFieldSection />
      <Separator />
      <OverlaySection />
      <Separator />
      <SelectionSection />
      <Separator />
      <DisplaySection />
    </div>
  );
}
