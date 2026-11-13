---
status: accepted
---

# Baseline UI toolkit

ADR-0001 allows a shared component only after a second consumer appears, while the glossary already accepts "another page or template project" as justification. A template consumer starts with no features, so the stricter reading would block every general composition forever. This ADR resolves the conflict: the template ships a closed **baseline toolkit** — the primitives and shared compositions listed in `.scratch/ui-baseline-toolkit/spec.md` — justified by the template consumer rather than a present call site. Anything outside that list still needs a real second consumer before it moves to `shared`.

## Considered Options

- **No baseline at all.** Rejected: it leaves every template consumer to rebuild dialogs, selects, tables, and empty/error wiring, which is the work the template exists to remove.
- **Install the full shadcn set.** Rejected: inventory bloat. Every vendored primitive is code the template must keep working across `shadcn add --overwrite`, and most of the set is never used by a CRUD or settings screen.
- **Publish a local shadcn registry.** Rejected for the same reason as ADR-0001: one repository consumes the components and there is no versioning pressure.
- **Add `@tanstack/react-table`.** Rejected for now. The backend contract is offset pagination without sorting; client-side sorting over the loaded page covers CRUD. Revisit if a project needs column visibility, grouping, or server-side sorting.
- **Promise-based `useConfirm()` provider.** Rejected for now. A declarative `ConfirmDialog` matches the existing `DataState` pattern and adds no global state to `providers.tsx`.

## Consequences

- The baseline is a closed list. Growing it needs an ADR amendment, not a convenience PR.
- `status-badge` earns its place only because `health-status` adopts it; that refactor is part of the baseline work, not optional cleanup.
- `DataTable` sorts only the rows of the current page until the API gains a `sort` parameter. This is a documented limitation, not a bug.
- Tier A and Tier B add no runtime dependency. A tier C component may bring one when a project actually needs it.
