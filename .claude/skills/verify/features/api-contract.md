# API contract

The Go API exposes liveness, readiness, and a problem+json error shape. The frontend proxies `/api`, `/healthz`, and `/readyz` to the backend.

## Sub-features

- `api-healthz` returns `{"status":"ok"}` with 200.
- `api-readyz` returns 200 with PostgreSQL and Redis checks.
- `api-problem` returns 404 and 405 as `application/problem+json`.
- `api-proxy` serves the same API through the frontend origin.
- `api-correlation` returns `X-Request-Id`, `X-Trace-Id`, and rate limit headers.

## How to get to it (user POV)

- Call the backend at `http://localhost:8080`.
- Call the same paths through the frontend at `http://localhost:3000`.

## Driving it with curl

Preconditions:

- The stack is healthy.
- Do not send a burst larger than the 60 request per minute limit.

- **Liveness.** Run `curl -fsS http://localhost:8080/healthz`. The body is `{"status":"ok"}`.
- **Readiness.** Run `curl -fsS http://localhost:8080/readyz`. The body contains `"status":"ok"`, `"postgres":"ok"`, and `"redis":"ok"`.
- **404 shape.** Run `curl -sS -o /dev/null -w '%{http_code} %{content_type}\n' http://localhost:8080/missing`. The output is `404 application/problem+json`. The body contains `"title":"Not Found"`, `"status":404`, and `"instance":"/missing"`.
- **405 shape.** Run `curl -sS -X POST -o /dev/null -w '%{http_code} %{content_type}\n' http://localhost:8080/healthz`. The output is `405 application/problem+json`.
- **Proxy.** Run `curl -sS -o /dev/null -w '%{http_code} %{content_type}\n' http://localhost:3000/api/v1/missing`. The output is `404 application/problem+json`, and the body's `instance` is `/api/v1/missing`.
- **Headers.** Run `curl -sS -D - -o /dev/null http://localhost:8080/healthz`. The response has `X-Request-Id`, `X-Trace-Id`, `X-Ratelimit-Limit: 60`, and `X-Ratelimit-Remaining`.
- **Proof.** Save the commands and bodies under `.verify/api-contract/<run id>/`, for example `headers.txt`, `missing.json`, and `readyz.json`.

## Gotchas

- The frontend proxies only `/api`, `/healthz`, and `/readyz`. An unknown path such as `/missing` on port 3000 returns nginx's HTML 404, not problem+json. Use `/api/v1/missing` for the proxied API 404.
- Readiness returns 503 with the same JSON shape when a dependency fails. The smoke script accepts only 200, so stop Redis only in the readiness journey and restart it.
- The rate limit is 60 requests per minute. A burst of error calls can trip 429 and invalidate later assertions.
- `X-Trace-Id` is present even when `OTEL_EXPORTER_OTLP_ENDPOINT` is empty. The empty endpoint disables export, not the header.
- Problem details include `instance` from the request path, so the proxied case differs from the direct case.
