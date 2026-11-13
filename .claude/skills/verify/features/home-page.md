# Home page

The home page is the default route. It identifies the app, shows the backend readiness card, lists the stack, and links back home from the header.

## Sub-features

- `home-render` renders the page title, description, and stack list at `/`.
- `home-nav` returns to `/` from the header `Home` link.
- `home-footer` shows the build attribution.
- `home-shell` serves the SPA shell on a direct load.

## How to get to it (user POV)

- Open `http://localhost:3000/`.
- Choose `Home` in the header from any page.

## Driving it with headless Chrome

Preconditions:

- The stack is healthy at `http://localhost:3000`.
- The harness is launched.

- **Open the route.** Run `./.claude/skills/verify/scripts/browser.mjs open http://localhost:3000/`. The JSON reports `url` `http://localhost:3000/` and `title` `Boilerplate`.
- **Read the page.** Run `./.claude/skills/verify/scripts/browser.mjs wait --text "A general-purpose foundation"` then `./.claude/skills/verify/scripts/browser.mjs snapshot --path .verify/home/<run id>/home.aria.txt`. The tree has a level 1 heading `Boilerplate`, a paragraph with the description, a list with 8 items from `React 19` through `openapi-fetch`, and a `contentinfo` region with `Built with React, Vite, and Tailwind CSS.`
- **Use the header link.** Run `./.claude/skills/verify/scripts/browser.mjs open http://localhost:3000/some/deep/link`, then `./.claude/skills/verify/scripts/browser.mjs click --role link --name "Home"`, then `./.claude/skills/verify/scripts/browser.mjs wait --text "A general-purpose foundation"`. The heading `Boilerplate` is present and `location.pathname` is `/`.
- **Proof.** Run `./.claude/skills/verify/scripts/browser.mjs screenshot --path .verify/home/<run id>/home.png`. The image shows the header, the readiness card, the stack card, and the footer.

## Gotchas

- The word `Boilerplate` appears in the header brand, the document title, and the level 1 heading. Assert the heading role, not the first match on the page.
- The stack card title `Stack` is not a heading in the accessibility tree. Read it as text.
- The home page also contains the readiness card. A home proof that fails while Redis is down is not a home page failure; check `/readyz` first.
- The header `Home` link and the not found page's `Go home` link are different accessible names. Match the exact name.
