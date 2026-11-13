# Theme toggle

The header button cycles the theme through system, light, and dark. The choice persists in `localStorage`, and the document gets the `dark` class when the resolved theme is dark.

## Sub-features

- `theme-cycle` advances system to light to dark to system.
- `theme-apply` adds or removes `dark` on `<html>`.
- `theme-persist` restores the stored choice after a reload.
- `theme-label` announces the current theme and the next one.

## How to get to it (user POV)

- Choose the theme button at the top right of any page.
- Read the button's accessible name to learn the current theme and the next one.

## Driving it with headless Chrome

Preconditions:

- The harness is launched.
- A full page load has happened once so the app has stored a theme. Reset it for a deterministic start.

- **Reset.** Run `./.claude/skills/verify/scripts/browser.mjs open http://localhost:3000/`, then `./.claude/skills/verify/scripts/browser.mjs eval 'localStorage.removeItem("theme")'`, then `./.claude/skills/verify/scripts/browser.mjs open http://localhost:3000/`. The button's accessible name is `System theme. Switch to Light.`
- **Light.** Run `./.claude/skills/verify/scripts/browser.mjs click --role button --name "System theme. Switch to Light."`, then `./.claude/skills/verify/scripts/browser.mjs eval '({ theme: localStorage.getItem("theme"), dark: document.documentElement.classList.contains("dark") })'`. The result has `theme: "light"` and `dark: false`. The button is now `Light theme. Switch to Dark.`
- **Persist.** Run `./.claude/skills/verify/scripts/browser.mjs open http://localhost:3000/` and repeat the eval. The result still has `theme: "light"` and `dark: false`.
- **Dark.** Run `./.claude/skills/verify/scripts/browser.mjs click --role button --name "Light theme. Switch to Dark."` and the eval. The result has `theme: "dark"` and `dark: true`. The button is now `Dark theme. Switch to System.` Save `snapshot --path .verify/theme/<run id>/dark.aria.txt` and `screenshot --path .verify/theme/<run id>/dark.png`.
- **System.** Run `./.claude/skills/verify/scripts/browser.mjs click --role button --name "Dark theme. Switch to System."`, then `./.claude/skills/verify/scripts/browser.mjs eval '({ theme: localStorage.getItem("theme"), dark: document.documentElement.classList.contains("dark"), systemDark: matchMedia("(prefers-color-scheme: dark)").matches })'`. The result has `theme: "system"` and `dark` equal to `systemDark`.
- **Proof.** Save `screenshot --path .verify/theme/<run id>/light.png` while the light theme is active. The light and dark screenshots show the same layout with different colors. The dark snapshot names the button `Dark theme. Switch to System.`

## Gotchas

- The accessible name changes with each click. Match the exact label from the current snapshot. A stale name fails the click.
- The harness starts on `about:blank`. `localStorage` is denied there, so open the app before reading or clearing it.
- The cycle starts at the stored theme, not always at system. Reset `localStorage` first.
- System mode follows the OS. Headless Chrome on this machine reports dark, so assert `dark` against `matchMedia`, not against the literal `true`.
- Each click changes only the class and storage. There is no network request to wait for.
- A full page load after each click is not needed for the cycle. Use `open` only for the persistence check.
