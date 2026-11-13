# Backend readiness

The home page shows whether the Go API can reach PostgreSQL and Redis. It reports `Operational` when both answer, `Degraded` when either fails, and refetches every 30 seconds or when the user chooses `Retry`.

## Sub-features

- `ready-operational` shows `Operational` and the success description when `/readyz` returns 200.
- `ready-degraded` shows `Degraded` and the failure description when `/readyz` returns 503.
- `ready-retry` sends a new `/readyz` request without reloading the page.
- `ready-live` follows a dependency change without a reload.

## How to get to it (user POV)

- Open `http://localhost:3000/` and read the `Backend readiness` card.
- Choose `Retry` on that card.

## Driving it with headless Chrome

Preconditions:

- The stack is healthy and `curl -fsS http://localhost:8080/readyz` reports `"status":"ok"`.
- The harness is launched.
- For the degraded journey, this run started the stack. Do not stop Redis on a stack you did not start.

- **Operational state.** Run `./.claude/skills/verify/scripts/browser.mjs open http://localhost:3000/`, then `./.claude/skills/verify/scripts/browser.mjs wait --text "Operational"`, then snapshot. The tree contains the text `Operational`, the description `All dependencies are responding.`, and a button named `Retry`.
- **Retry request.** Run `./.claude/skills/verify/scripts/browser.mjs eval 'performance.getEntriesByType("resource").filter((entry) => entry.name.includes("/readyz")).length'`, then `./.claude/skills/verify/scripts/browser.mjs click --role button --name "Retry"`, then the same eval. The count increases by one.
- **Degraded state.** Run `docker compose -f deploy/docker-compose.yml stop redis`. Poll `curl -sS -o /dev/null -w '%{http_code}' http://localhost:8080/readyz` until it returns `503`, for up to 30 seconds. Run `./.claude/skills/verify/scripts/browser.mjs open http://localhost:3000/`, then `./.claude/skills/verify/scripts/browser.mjs wait --text "Degraded" --timeout 40000`, then snapshot. The tree contains `Degraded` and `One or more dependencies are unavailable.`
- **Recovery.** Run `docker compose -f deploy/docker-compose.yml start redis`. Poll `/readyz` until it returns `200`. Run `./.claude/skills/verify/scripts/browser.mjs click --role button --name "Retry"`, then `./.claude/skills/verify/scripts/browser.mjs wait --text "Operational" --timeout 20000`.
- **Proof.** Save `snapshot --path .verify/readiness/<run id>/operational.aria.txt`, `screenshot --path .verify/readiness/<run id>/operational.png`, `snapshot --path .verify/readiness/<run id>/degraded.aria.txt`, `screenshot --path .verify/readiness/<run id>/degraded.png`, and the two `/readyz` bodies.

## Gotchas

- `/healthz` stays 200 while Redis is down. Assert `/readyz`.
- The card refetches every 30 seconds, so a degraded state can appear without a click. Do not credit `Retry` for a change the interval produced.
- Redis failure makes readiness degraded but rate limiting fails open, so the rest of the UI still loads.
- Restart Redis before you leave. A stopped Redis makes every later journey degraded.
- The retry request count only covers requests since the last full page load. A reload resets `performance`.
