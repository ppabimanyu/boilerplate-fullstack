# Not found

An unknown route renders the in-app not found page while the server returns the SPA shell with HTTP 200. The page offers `Go home`.

## Sub-features

- `notfound-deeplink` renders on a direct load of an unknown path.
- `notfound-content` shows `404`, `Page not found`, and the explanation.
- `notfound-home` returns to `/` from `Go home`.

## How to get to it (user POV)

- Open an unknown deep link such as `http://localhost:3000/some/deep/link`.
- Choose `Go home`.

## Driving it with headless Chrome

Preconditions:

- The stack is healthy.
- The harness is launched.

- **Deep link.** Run `./.claude/skills/verify/scripts/browser.mjs open http://localhost:3000/some/deep/link`. The JSON reports the same `url` and `title` `Boilerplate`.
- **Page content.** Run `./.claude/skills/verify/scripts/browser.mjs wait --text "Page not found"` and `./.claude/skills/verify/scripts/browser.mjs snapshot`. The tree has a paragraph `404`, a level 1 heading `Page not found`, the paragraph `The page you are looking for does not exist.`, and a link named `Go home`.
- **Return home.** Run `./.claude/skills/verify/scripts/browser.mjs click --role link --name "Go home"`, then `./.claude/skills/verify/scripts/browser.mjs wait --text "A general-purpose foundation"`, then `./.claude/skills/verify/scripts/browser.mjs eval '({ path: location.pathname, heading: document.querySelector("h1")?.textContent })'`. The result has `path: "/"` and `heading: "Boilerplate"`.
- **Proof.** Save `snapshot --path .verify/not-found/<run id>/not-found.aria.txt`, `screenshot --path .verify/not-found/<run id>/not-found.png`, and the eval result after the click.

## Gotchas

- `curl` on the same URL returns `200 text/html` because nginx serves the SPA shell. Assert the rendered page, not the status code.
- `Go home` is a link in the accessibility tree, not a button, because the shadcn button renders an anchor through `asChild`. Match `--role link`.
- The header also has a `Home` link. Match the exact name `Go home`.
- The API 404 is a different surface. `/api/v1/missing` returns problem+json through the frontend proxy. See [api-contract.md](./api-contract.md).
