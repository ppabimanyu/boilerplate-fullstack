# Theme toggle proof

Run id `20261113T015741Z`. Feature `theme-toggle`. Entry point is the header theme button on the home page.

## Setup

The stack was stopped before this run. Launch followed `SKILL.md`:

```bash
docker info
make dev
curl -fsS --retry 60 --retry-connrefused --retry-delay 2 http://localhost:3000/readyz
./.claude/skills/verify/scripts/browser.mjs launch
./scripts/smoke.sh
```

`readyz` returned `{"status":"ok","checks":{"postgres":"ok","redis":"ok"}}`. The smoke test ended with `smoke test passed`. The harness reported `"running": true` with Chrome/157.0.8103.51.

## Journey

```bash
./.claude/skills/verify/scripts/browser.mjs open http://localhost:3000/
./.claude/skills/verify/scripts/browser.mjs eval 'localStorage.removeItem("theme")'
./.claude/skills/verify/scripts/browser.mjs open http://localhost:3000/
./.claude/skills/verify/scripts/browser.mjs snapshot --path .verify/theme/20261113T015741Z/reset.aria.txt
./.claude/skills/verify/scripts/browser.mjs click --role button --name "System theme. Switch to Light."
./.claude/skills/verify/scripts/browser.mjs eval '({ theme: localStorage.getItem("theme"), dark: document.documentElement.classList.contains("dark") })'
./.claude/skills/verify/scripts/browser.mjs screenshot --path .verify/theme/20261113T015741Z/light.png
./.claude/skills/verify/scripts/browser.mjs open http://localhost:3000/
./.claude/skills/verify/scripts/browser.mjs eval '({ theme: localStorage.getItem("theme"), dark: document.documentElement.classList.contains("dark") })'
./.claude/skills/verify/scripts/browser.mjs click --role button --name "Light theme. Switch to Dark."
./.claude/skills/verify/scripts/browser.mjs eval '({ theme: localStorage.getItem("theme"), dark: document.documentElement.classList.contains("dark") })'
./.claude/skills/verify/scripts/browser.mjs snapshot --path .verify/theme/20261113T015741Z/dark.aria.txt
./.claude/skills/verify/scripts/browser.mjs screenshot --path .verify/theme/20261113T015741Z/dark.png
./.claude/skills/verify/scripts/browser.mjs click --role button --name "Dark theme. Switch to System."
./.claude/skills/verify/scripts/browser.mjs eval '({ theme: localStorage.getItem("theme"), dark: document.documentElement.classList.contains("dark"), systemDark: matchMedia("(prefers-color-scheme: dark)").matches })'
```

## Results

- After the reset, the button name is `System theme. Switch to Light.`
- After one click, `theme` is `light` and `dark` is `false`. The same values survive a reload.
- After the next click, `theme` is `dark` and `dark` is `true`. `dark.aria.txt` names the button `Dark theme. Switch to System.`
- After the last click, `theme` is `system` and `dark` equals `systemDark`.
- The light and dark screenshots show the same layout with different colors.

## Not covered in this run

This run proves the theme toggle only. The home page, readiness, not found, and API contract entries were exercised while building the skill, but this run's artifacts do not claim them.

## Note on the first attempt

The first attempt ran the reset eval before any page had loaded. The harness starts on `about:blank`, where `localStorage` throws a `SecurityError`. The feature file now opens the app before clearing storage, and that order is what this run used.
