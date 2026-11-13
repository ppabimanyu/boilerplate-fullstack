# Boilerplate verification map

This directory is the maintained source for verifying the user-facing behavior of Boilerplate. Read this index before driving the app, then use the matching feature file as the recipe.

## Baseline preconditions

- Launch the stack and the harness as [../SKILL.md](../SKILL.md) describes.
- `./scripts/smoke.sh` ends with `smoke test passed`.
- The harness `status` command reports `"running": true`.
- The app has no authentication and no domain data. A fresh database volume is enough; there is nothing to seed.
- Use one run id for the whole run, `RUN_ID="$(date -u +%Y%m%dT%H%M%SZ)"`, and keep every artifact under `.verify/<feature>/<run id>/`.
- One drive at a time. The harness owns one Chrome profile and one page target.

## Driving conventions

- Start every journey at the URL its feature file names.
- Take a `snapshot` before the first click. Use the role and exact accessible name from the tree.
- Run every command from the repo root.
- After a click that changes the page, `wait --text` before you evaluate the new state.
- Read response bodies, not only status codes.
- Assert what a user can observe. A passing unit test or a build is not evidence for a journey.

## Proof and skip reporting

- UI proof is an ARIA snapshot plus a screenshot. Name the feature id and entry point in the artifact directory or `notes.md`.
- Capture the action and the resulting state. A screenshot of the final screen alone is not proof.
- Pair each UI state with its side effect. Readiness uses `/readyz`, theme uses `localStorage` and the `html.dark` class, and the API contract uses status and content type.
- Report an unreachable entry point with the attempted command and the unmet precondition. Mark it skipped in `notes.md`.
- Do not report a skipped entry point as verified through a different path.

## Features

- [Home page](./home-page.md) covers the default route, header navigation, stack list, and footer.
- [Backend readiness](./readiness.md) covers the operational, degraded, and retry states of the readiness card.
- [Theme toggle](./theme-toggle.md) covers the system, light, and dark cycle, persistence, and the document class.
- [Not found](./not-found.md) covers a deep link to an unknown route and the return home.
- [API contract](./api-contract.md) covers liveness, readiness, problem+json errors, the frontend proxy, and response headers.
