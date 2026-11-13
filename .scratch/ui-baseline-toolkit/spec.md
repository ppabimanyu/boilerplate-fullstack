# UI baseline toolkit

Status: ready-for-human

Grow the template's component inventory from 10 primitives and 4 shared components to a closed baseline toolkit, so a new project can build a CRUD screen and a settings screen without rebuilding dialogs, selects, tables, and status indicators.

Decisions live in [ADR-0002](../../docs/adr/0002-ui-baseline-toolkit.md), which amends [ADR-0001](../../docs/adr/0001-ui-component-layers.md). Vocabulary is in [GLOSSARY.md](../../GLOSSARY.md).

## Current inventory

`src/components/ui` — `alert`, `button`, `card`, `empty`, `field`, `input`, `label`, `separator`, `spinner`, `textarea`.

`src/components/shared` — `data-state` (loading/empty/error/ready), `form-field` (React Hook Form + Zod), `page-header`, `health-status`, `theme-toggle`.

Installed but unused for UI: `radix-ui`, `sonner`, `lucide-react`, `class-variance-authority`.

Backend list contract, already fixed: `?limit=&offset=` → `{items, total, limit, offset}`, `DefaultLimit = 20`, `MaxLimit = 100`, no `sort` parameter.

## Constraints

- No new runtime dependency in tier A or tier B.
- Primitives are vendored shadcn output in `components/ui`; customisation belongs in `components/shared`, never in `components/ui`.
- A primitive that exports a `cva` variants object needs that export name added to `allowExportNames` in `frontend/eslint.config.js`, because `react-refresh/only-export-components` rejects it otherwise.
- Every new component ships with a `_gallery` demo and a Vitest + RTL test.
- Tier C is explicitly out of scope until a project needs it.

## Tier A — primitives

Install with `npx shadcn add dialog alert-dialog select dropdown-menu table badge skeleton tabs tooltip avatar`.

| Primitive | Required by | Notes |
| --- | --- | --- |
| `dialog` | `confirm-dialog` sibling, feature forms | Radix Dialog, keeps focus trap and escape handling |
| `alert-dialog` | `confirm-dialog` | Destructive confirmation, not for forms |
| `select` | `pagination` page size, feature filters | Radix Select, keyboard typeahead included |
| `dropdown-menu` | row actions, account menu | Not a replacement for `select` in forms |
| `table` | `data-table` | Markup only; behaviour stays in the shared composition |
| `badge` | `status-badge` | Variants must come from theme tokens, not raw colours |
| `skeleton` | table and card loading | Complements, does not replace, the `DataState` spinner |
| `tabs` | settings sections | Only for same-page peer sections, not routing |
| `tooltip` | icon-only buttons | Never the only label for an action |
| `avatar` | account menu, list rows | Fallback initials required |

Acceptance: each primitive passes `tsc --noEmit`, `eslint`, and appears in `_gallery` with its variants.

## Tier B — shared compositions

| Component | Contract | Acceptance |
| --- | --- | --- |
| `pagination` | `total`, `limit`, `offset`, `onOffsetChange`, `pageSizeOptions` | Shows the visible range (`1–20 of 134`), disables edges correctly, emits offset 0 on page-size change |
| `data-table` | `columns`, `rows`, `rowKey`, `total`, `limit`, `offset`, `onOffsetChange`, `isLoading`, `error`, `emptyTitle`, `emptyDescription` | Delegates loading, error, and empty to `DataState`; sorts only the current page and says so in the component doc comment |
| `confirm-dialog` | `open`, `onOpenChange`, `onConfirm`, `title`, `description`, `confirmLabel`, `destructive` | Declarative, caller owns state; focus returns to the trigger on close |
| `status-badge` | `status` (`success`/`warning`/`danger`/`neutral`/`pending`), `label`, `dot` | `health-status` is refactored to use it, which is the consumer that justifies its existence |
| `search-input` | `value`, `onValueChange`, `placeholder`, `debounceMs` | Backed by `use-debounce`; clear button; never debounces the initial value |
| `submit-button` | `isSubmitting`, `children`, `pendingLabel` | Reads pending state from props, not from a form context; spinner matches `DataState` loading |
| `settings-section` | `title`, `description`, `actions`, `children` | Card-based, used by the settings page shape; no domain fields |
| `copy-button` | `value`, `label` | Writes to clipboard, confirms with a `sonner` toast, degrades when the clipboard API is unavailable |

New hook: `use-debounce` in `src/hooks/`, used only by `search-input`.

## Definition of done

A component is done when all four are true:

1. It is exported from its layer directory and typed with no `any`.
2. It has a `_gallery` section in `src/app/gallery-page.tsx`.
3. It has a Vitest + RTL test asserting observable behaviour, not internals.
4. It has a glossary entry if it introduces new vocabulary.

## Sequencing

1. **Docs** (this spec, ADR-0002, glossary) — review gate. ✅ approved
2. **Tier A primitives**, one commit per group: overlays (`dialog`, `alert-dialog`, `tooltip`), selection (`select`, `dropdown-menu`), display (`table`, `badge`, `skeleton`, `tabs`, `avatar`). ✅ installed, gallery split into `src/app/_gallery/`, `tsc` + `eslint` + `vitest` + `vite build` pass
3. **`status-badge` + `health-status` refactor** — proves the baseline rule with a real consumer.
4. **`pagination` → `data-table`** — table depends on pagination.
5. **`confirm-dialog`**, then `search-input` + `use-debounce`, `submit-button`, `settings-section`, `copy-button`.
6. **`_gallery` consolidation** and a final `make lint`, `make test`, `make build`.

## Non-goals

Charts, calendar and date picker, command palette, file upload and dropzone, editable data grid, virtualized list, multi-step wizard, rich text. Each needs a dependency or a domain that the boilerplate does not have yet.

## Pending decisions

Confirm before step 3 of the sequencing:

- **URL-synced list state.** `data-table` stays router-agnostic and receives `offset`/`onOffsetChange` as props. A separate `use-list-query` hook in `src/hooks/` owns the URL search params (`limit`, `offset`, `q`) and is used by pages. This keeps `data-table` testable without a router. Alternative: fold URL sync into `data-table`, which couples the component to React Router.
