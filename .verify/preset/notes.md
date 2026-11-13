# shadcn preset proof

Preset `b27GcrRo`, applied with `pnpm dlx shadcn@latest apply --preset b27GcrRo -y` in `frontend/`.

Decoded values from `shadcn preset decode b27GcrRo --json`:

- style `radix-rhea`
- theme `neutral`
- baseColor `neutral`
- font `inter`
- fontHeading `inherit`
- radius `default`
- iconLibrary `lucide`
- menuColor `default`
- menuAccent `subtle`
- chartColor `neutral`

## Files changed

- `components.json` moved from `new-york` to `radix-rhea` and recorded the menu settings.
- `src/index.css` imports Inter, `shadcn/tailwind.css`, and `tw-animate-css`, maps `--font-sans` to Inter, and adds the larger radius scale.
- `src/components/ui/button.tsx` and `src/components/ui/card.tsx` were replaced with the rhea versions.
- `src/lib/utils.ts` now re-exports `cn` from the `cn` package.
- `package.json` and `package-lock.json` added the preset dependencies. The now-unused `@radix-ui/react-slot`, `clsx`, and `tailwind-merge` were removed.

## Checks

```bash
cd frontend
npm run typecheck
npm run lint
npm run test -- --run
npm run build
```

Typecheck, lint, and build passed. Vitest passed 2 tests in 1 file. The backend suite also passed through `make test`.

The running stack passed `./scripts/smoke.sh`.

## Browser proof

```bash
./.claude/skills/verify/scripts/browser.mjs open http://localhost:3000/
./.claude/skills/verify/scripts/browser.mjs wait --text "Operational"
./.claude/skills/verify/scripts/browser.mjs screenshot --path .verify/preset/home-dark.png
./.claude/skills/verify/scripts/browser.mjs click --role button --name "System theme. Switch to Light."
./.claude/skills/verify/scripts/browser.mjs screenshot --path .verify/preset/home-light.png
./.claude/skills/verify/scripts/browser.mjs open http://localhost:3000/some/deep/link
./.claude/skills/verify/scripts/browser.mjs screenshot --path .verify/preset/not-found-light.png
```

Computed values from the running app:

- body font `"Inter Variable", sans-serif`
- card radius `24px`
- small button height `28px`
- icon button width `32px`

The page console collected no errors. The Retry button issued a second `/readyz` request. `Go home` returned to `/` with the `Boilerplate` heading.

The pre-preset screenshots are in `.verify/theme/20261113T015741Z/light.png` and `dark.png`.
