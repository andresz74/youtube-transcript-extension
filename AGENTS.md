# Repository Guidelines

## Project Structure & Module Organization

This repository is a Manifest V3 Chrome extension.

- `manifest.json`: extension metadata, permissions, content/background wiring.
- `src/popup.html`: popup UI markup.
- `src/popup.js`: popup orchestration and event wiring.
- `src/transcript-api.js`: transcript API client with timeout and error parsing.
- `src/url-detection.js`: active tab URL + embedded iframe detection helpers.
- `src/ui.js`: popup rendering helpers.
- `src/config.js`: API base URL and request timeout configuration.
- `styles/styles.css`: popup styling and design tokens.
- `icons/`: extension icons (`16`, `48`, `128`).

Keep feature logic in `src/popup.js` unless it must run in a content script or service worker context.

## Build, Test, and Development Commands

Node-based quality checks are available.

- Install deps: `npm install`
- Lint: `npm run lint`
- Format check: `npm run format:check`
- Format write: `npm run format`
- Tests: `npm test`
- Load locally: `chrome://extensions` -> enable **Developer mode** -> **Load unpacked** -> select repo root.
- Reload after edits: use the extension card’s **Reload** button in `chrome://extensions`.
- Validate manifest JSON: `cat manifest.json | jq .`
- Inspect logs: open popup DevTools from the extension card.

If backend transcript calls fail, verify the API base URL override in `src/config.js` (or `localStorage`) and that the transcript service is running.

## Coding Style & Naming Conventions

- JavaScript/CSS use 4-space indentation and semicolons.
- Prefer `const`/`let`; avoid `var`.
- Use camelCase for variables/functions (`fetchTranscript`, `videoUrl`).
- Keep DOM selectors and constants near file top.
- Keep CSS custom properties in `:root`; follow existing token names like `--accent`, `--line`.

## Testing Guidelines

Automated tests are not configured yet; use manual verification.

- Test on `youtube.com/watch`, `youtu.be`, and `youtube.com/shorts` URLs.
- Verify language dropdown behavior, transcript rendering, and copy button state transitions.
- Confirm error states (no video found, API failure) in popup UI.

For future tests, place them under `tests/` with names like `popup.transcript.spec.js`.

## Commit & Pull Request Guidelines

Recent history follows Conventional Commit-style prefixes.

- Prefer: `feat: ...`, `fix: ...`, `chore: ...`.
- Keep commits focused and scoped to one change.

PRs should include:

- Clear summary of behavior changes.
- Linked issue (if applicable).
- Before/after screenshots for popup UI changes.
- Manual test notes with pages/scenarios verified.
