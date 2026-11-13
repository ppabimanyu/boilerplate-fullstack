---
status: amended by ADR-0002
---

# UI component layers and generated code ownership

The template needs reusable UI on top of shadcn without becoming a speculative design system. Shadcn primitives stay in `src/components/ui` as vendored generated code, domain-neutral compositions live in `src/components/shared`, and feature-specific blocks stay in `src/features/<name>`. Components ship in-repo first. A block moves to `shared` only after a second consumer appears.

## Considered Options

- Editing `components/ui` for every customization. Rejected because `shadcn add --overwrite` would erase the edits and every template consumer would drift from upstream.
- Adding a `components/blocks` directory now. Rejected because there is only one consumer for each candidate block, so the directory would hold guesses.
- Publishing a local shadcn registry immediately. Rejected because one repository consumes the components and there is no versioning pressure.

## Consequences

- A change to `components/ui` needs a recorded reason and should stay small enough to reapply after `shadcn add --overwrite`.
- Customization belongs in `shared` compositions.
- A block is promoted to `shared` only when a second page or template consumer needs it.
