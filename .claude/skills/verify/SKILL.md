---
name: verify
description: Drive the running Boilerplate fullstack app and prove user-facing behavior with headless Chrome, ARIA snapshots, screenshots, and curl. Use for a UI change, a readiness or theme change, a routing change, or an API contract change before calling it done.
---

# Verify Boilerplate

Drive the real stack, not unit tests. The stack is a Go API on port 8080 with PostgreSQL and Redis, and a React SPA on port 3000 behind nginx. The frontend proxies `/api`, `/healthz`, and `/readyz` to the API.

Read [features/README.md](features/README.md) before a run, then open the file for the journey you are proving.

## Launch

Run from the repo root.

1. Confirm Docker answers.

   ```bash
   docker info
   ```

   On this Mac the daemon comes from OrbStack. If `docker info` fails, run `orbctl start` and wait.

2. Start the stack.

   ```bash
   make dev
   ```

   The first run builds images. Compose starts PostgreSQL, Redis, the one-shot goose migration, the API, and the frontend. The API waits for the migration job to finish.

3. Wait for readiness through the frontend proxy.

   ```bash
   curl -fsS --retry 60 --retry-delay 2 --retry-all-errors http://localhost:3000/readyz
   ```

   Ready means the body contains `"status":"ok"`, `"postgres":"ok"`, and `"redis":"ok"`, and `curl -fsS http://localhost:3000/` returns the app shell. The app has no seed data.

4. Start the browser harness.

   ```bash
   ./.claude/skills/verify/scripts/browser.mjs launch
   ```

   The command prints the Chrome pid and DevTools port.

The frontend port is `${FRONTEND_PORT:-3000}` and the API port is 8080. Every command here assumes 3000 and 8080.

The stack owns host ports 3000, 8080, 5432, and 6379. Check ownership before driving.

```bash
docker compose -f deploy/docker-compose.yml ps
lsof -nP -iTCP:3000 -sTCP:LISTEN
lsof -nP -iTCP:8080 -sTCP:LISTEN
```

If the `boilerplate-*` containers are already up and the doctor passes, reuse the stack and leave it running when you finish. A reused stack may run an older image, so run `make dev` yourself when the proof must match the working tree. If a foreign process owns 3000 or 8080, stop and report it.

Teardown is in Cleanup.

## Doctor

Run the repository smoke test.

```bash
./scripts/smoke.sh
```

Proceed only when it ends with `smoke test passed`. The check is read-only and covers both health endpoints, the frontend SPA fallback, the `/api` proxy, the problem+json 404, and the correlation headers.

Check the harness when a session may already exist.

```bash
./.claude/skills/verify/scripts/browser.mjs status
```

A usable session reports `"running": true` and a `browser` version. If a state file exists but the pid is gone, run `stop`, then `launch`.

## Drive

The harness is headless Chrome over CDP with no npm dependencies. It keeps one profile and one page until `stop`.

```bash
./.claude/skills/verify/scripts/browser.mjs open http://localhost:3000/
./.claude/skills/verify/scripts/browser.mjs wait --text "Operational" --timeout 15000
./.claude/skills/verify/scripts/browser.mjs snapshot
./.claude/skills/verify/scripts/browser.mjs click --role button --name "Retry"
./.claude/skills/verify/scripts/browser.mjs eval 'document.title'
./.claude/skills/verify/scripts/browser.mjs screenshot --path .verify/example.png
./.claude/skills/verify/scripts/browser.mjs console
```

- `open` navigates and waits until the document at that URL is complete.
- `wait` polls the rendered text. Use it after a click that changes the page or fetches data.
- `snapshot` prints the accessibility tree. Take names and roles from it; do not guess CSS selectors.
- `click` and `fill` match the tree by role and exact accessible name.
- `eval` returns JSON for state the page does not show, such as `localStorage` and `performance` entries.
- `screenshot` captures the full page.
- `console` prints page errors collected since the last `open`.
- A failed command prints `{"error": ...}` and exits non-zero.

One drive at a time. The harness owns a single Chrome profile and one page target, so two runs share a tab.

## Evidence

Set one run id per verification run and keep the proof under `.verify/<feature>/<run id>/`.

```bash
RUN_ID="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p ".verify/theme/$RUN_ID"
```

`.verify/` is gitignored. Cleanup keeps it.

Capture these artifacts:

- `snapshot --path .../state.aria.txt` for the accessibility tree.
- `screenshot --path .../state.png` for the rendered page.
- `eval` output and curl bodies as `.json` or `.txt`.
- `notes.md` with the commands you ran and the result you saw.

Every claim follows these rules.

- Drive the user path in the feature map. Do not call internal setters or test-only endpoints.
- Capture the action and the resulting state. A final screenshot alone is not proof.
- Pair the visible state with its side effect. Readiness uses the card plus `/readyz`; theme uses the button label plus `localStorage.theme` and the `html.dark` class; the API contract uses the status plus the content type.
- Wait for text or state. Fixed sleeps are not evidence.
- If an entry point cannot run, record the attempted command and the unmet precondition and report it as skipped. Do not substitute a different entry point.

## Cleanup

1. Stop the harness.

   ```bash
   ./.claude/skills/verify/scripts/browser.mjs stop
   ```

   It kills only the Chrome pid that owns the harness profile and removes that temp profile.

2. If the run stopped Redis for the degraded readiness journey, start it again.

   ```bash
   docker compose -f deploy/docker-compose.yml start redis
   ```

3. Stop the stack only if this run started it.

   ```bash
   make down
   ```

   If the stack was already running when the run began, leave it running.

4. Confirm the evidence is still present.

   ```bash
   ls ".verify/<feature>/<run id>"
   ```

   Do not delete `.verify/`.

## Helpers

`scripts/browser.mjs` is the headless Chrome driver. It needs Node 22 or newer and a Chrome or Chromium binary. It looks at the standard macOS and Linux install paths and reads `CHROME_PATH` when yours is elsewhere.

`./scripts/smoke.sh` is the repository doctor. This skill uses it and does not replace it.
