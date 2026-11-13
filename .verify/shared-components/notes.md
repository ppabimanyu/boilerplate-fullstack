# Shared component proof

Run date 2026-11-13. Scope was the first shared component pass from the grill: `PageHeader`, `DataState`, `FormField`, and a dev-only gallery.

## Primitives added

```bash
cd frontend
pnpm dlx shadcn@latest add field input textarea empty spinner alert -y
```

The command added `field`, `input`, `textarea`, `empty`, `spinner`, `alert`, and the `label` and `separator` dependencies.

## Checks

```bash
cd frontend
npm run typecheck
npm run lint
npm run test -- --run
npm run build
cd ..
make test
```

Typecheck, lint, and build passed. Vitest passed 9 tests in 4 files. The backend suite passed through `make test`.

The production build contains no gallery chunk and no `Component gallery` text.

```bash
ls frontend/dist/assets | grep -i gallery
grep -Rl "Component gallery" frontend/dist
```

Both commands returned nothing.

## Browser proof

The Docker stack was started with `make dev` and passed `./scripts/smoke.sh`.

Production checks:

- `http://localhost:3000/` shows the `PageHeader` heading and description, and the readiness card reads `Operational`.
- `http://localhost:3000/_gallery` renders the 404 page, proving the gallery route is dev-only.

Gallery checks used `npm run dev -- --host 127.0.0.1` and `http://127.0.0.1:5173/_gallery`:

- Loading, empty, error, and ready states render.
- `Try again` switches the error example to the recovered state, and `Show error again` switches it back.
- `New project` fires the gallery toast.
- Submitting the empty form shows both validation errors with red field rings.
- Submitting `Ada` and `Build a reusable component gallery.` shows the `Form submitted` toast and resets the fields.
- The theme toggle switches the gallery between dark and light.
- The browser console collected no errors.

The React Router hydration warning that appeared on the first gallery load was fixed with the root `RouteFallback`. The Vite log kept the one old warning and recorded no new warning after the fix.

## Artifacts

- `home-production.png` and `home.aria.txt`
- `gallery-production-404.png`
- `gallery-dark.png` and `gallery-dark.aria.txt`
- `gallery-light.png` and `gallery-light.aria.txt`
- `gallery-error-recovered.png`
- `gallery-form-errors.png` and `gallery-form-errors.aria.txt`
- `gallery-form-success.png`

The Docker stack, Vite server, and browser harness were stopped after the run. Ports 3000, 5173, and 8080 are free.
