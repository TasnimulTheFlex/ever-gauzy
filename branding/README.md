# Base360 white-label brief

This fork ships Gauzy as **Base360 Time Tracker**. A user must never see "Gauzy", "Ever", "Ever Co.", "Ever Gauzy",
gauzy.co, ever.co, ever-co social links or Ever/Gauzy logos — in the web app, desktop timer, emails, PDFs,
installers, OS app name, tray, notifications, window titles, browser tab, API docs page or error text.

## Brand

| Item | Value |
|---|---|
| Product name | Base360 Time Tracker (short: Base360) |
| Desktop app name | Base360 Timer |
| Company | Base360 |
| Website | https://base360.ai |
| Privacy / Terms | https://base360.ai/legal#privacy (use https://base360.ai/legal for terms) |
| Web app | https://time.base360.ai |
| API (desktop "server URL") | https://time-api.base360.ai |
| Support email | support@base360.ai |
| Primary color | #064749 (tint rgba(6,71,73,0.10)) |
| Desktop app id | com.base360.timetracker |
| Desktop deep-link protocol | base360-timer |
| Releases / update source | GitHub TasnimulTheFlex/base360-time-tracker (never ever-co) |
| Source code (AGPL §13) | https://github.com/TasnimulTheFlex/base360-time-tracker |

Assets in this folder: `base360-logo.svg` (the mark, 25×25), `icon-512.png`, `icon-192.png`, `icon-maskable-512.png`,
`apple-touch-icon.png`, `favicon.ico/.svg/.png`. A wordmark = the mark + the text "Base360" in #064749, semibold.
Generate any other size or format (PNG sets, .ico, .icns via `sips`/`iconutil` on macOS) from these.

## Rules (all agents)

1. Change only what a user can see. NEVER rename: npm packages (`@gauzy/*`), import paths, file/folder names that code
   imports, TypeScript symbols, Angular selectors, CSS classes referenced in code, DB entities/columns/migrations,
   API routes, env var NAMES, i18n KEYS, Electron IPC channel names, nx project names. Changing env var DEFAULT values is fine.
2. Keep `LICENSE`, `LICENSES.md`, `CREDITS.md` and copyright/license headers in source files (AGPL requirement).
   Developer docs/READMEs/code comments are not user-visible: leave them.
3. Links to Gauzy docs, help, downloads, register, pricing, social media, GitHub of ever-co: point to the Base360 value
   above, or remove the link/button when there is no equivalent. Remove "Powered by"/"by Ever Co." credits.
4. Replace Gauzy/Ever logos and images with the Base360 assets (same file path when code references it, so imports keep working).
5. Do not run `yarn install`/`npm install` or builds (the integrator builds after merging). Keep every edit syntactically valid.
6. Commit to your branch in small logical commits (`chore(branding): …`). No Co-Authored-By trailers. Do not push.
7. Before finishing, audit your owned paths: `grep -rniE "gauzy|ever co|ever\.co|ever-co|evertech|ever team" <paths>`
   excluding node_modules, and write `branding/AUDIT-<area>.md`: what you changed, and every remaining hit that a user
   could see (should be none) or a one-line reason it is not user-visible.
