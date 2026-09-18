# Daroub — agent handoff

## Baseline

Source revision: a36be21721e3a2ada7f8c8d5c435acdbf96f054e (published release14).
Live reference: https://daroub-terrain-guide.ifritliwa.chatgpt.site
This handoff is documentation added to the export; application source files match that revision.

## Stack / architecture

React19 / TypeScript / Vinext (Vite-backed Next-style routes) / Cloudflare Worker / D1 / Drizzle. Use package-lock.json and `npm run install:ci`; do not upgrade dependencies just to open the project. Files under `build/` and `scripts/` are vendored and self-contained.

Use native anchor navigation. The pinned framework had a production RSC navigation defect; `build/rsc-asset-order.ts` also guards emitted CSS/JS ordering. Test the compiled Worker, not only dev mode, for navigation changes.

## Current product

- Arabic, English, French, Chinese and Hindi; RTL, reduced motion, keyboard controls and text enlargement.
-14 source-linked destinations in4 terrain categories. Globe auto-rotates at8degrees/second unless reduced motion is enabled; user control pauses it.
- Trips, packing suggestions, private inventory, itinerary, shared group preparation and invitations.
- Email/password accounts with one-time recovery codes; ChatGPT remains an alternative. No email sender or CAPTCHA configured. Do not claim email verification.
- Owner-scoped D1 records with revisions/operation IDs and account-scoped IndexedDB synchronization. Conflicts remain recoverable copies.
- Weather: Open-Meteo primary, MET Norway forecast fallback, separate historic monthly requests, explicit provider/timestamps/missing values/stale cache. Honor provider cooldowns and visible-page polling.
- Dedicated `/fieldbook?destination=...` reader, PDF downloads, official further-reading sources and saved offline reading.90 PDFs:14 destinations plus4 general terrain guides, each in5languages. Free coordinates must not imply verified local species or destination information.
- Retrieval assistant works without provider keys. Optional generative AI is server-only and opt-in; proposed trip edits require explicit user action.
- Compatible BLE heart-rate devices only, ephemeral readings, sustained alerts; not a native watch app or external emergency dispatch service.

## Files to orient yourself

- `components/globe-surface.tsx`, `components/globe-weather.tsx`, `components/weather.tsx`
- `lib/weather-service.ts`, `lib/weather-client.ts`, `lib/weather-providers.ts`
- `components/fieldbook-reader.tsx`, `components/region-report.tsx`, `components/offline-library.tsx`
- `lib/fieldbook-pdfs.json`, `lib/official-region-books.json`, `public/fieldbooks/`
- `lib/catalog-seed.ts`, `lib/terrain.ts` and catalog contracts
- `lib/local-auth-server.ts`, `app/chatgpt-auth.ts`, `app/api/auth/route.ts`
- `lib/sync-server.ts`, synchronization and shared-board tests
- `drizzle/0000...0003*.sql`: apply in order, never replace the live database with an empty one.

## Portability and security boundaries

`handoff/wrangler.local.json` is an export-only local migration config with a placeholder D1 ID. Use `--local` and `.wrangler/state`. No production database access is bundled.

Real ChatGPT authentication relies on trusted headers inserted by the Sites gateway. If moving to another host, replace that gateway integration or disable the ChatGPT path and reject/strip incoming `oai-authenticated-user-*` headers at a trusted boundary. Never trust caller-provided identity headers on a publicly reachable Worker. The development mock exists only for loopback development.

`.env.example` documents optional settings. Keep AI keys server-side. Empty DAROUB_OWNER_IDS/DAROUB_EDITOR_IDS grant no editorial roles. Password-account emails have not been externally verified and must not automatically link to ChatGPT identities by matching email.

## Books

Existing PDF files work as static assets; Python is not required to run/build the website. To regenerate them, inspect `scripts/export-fieldbook-data.mjs` and `scripts/build-fieldbooks.py`. The latter needs reportlab, uharfbuzz, arabic-reshaper and python-bidi, plus Arial/Nirmala/YaHei fonts or adapted licensed font paths. It currently uses a fixed edition date; update the date deliberately for a new publication. Preserve shaping/RTL and visually inspect Arabic, Hindi and Chinese output.

## Most recent verification

322 distinct tests passed (321 in the broad run, with the emitted-build check rerun successfully after compilation); TypeScript and build passed; lint had0errors and13image warnings. Independent weather review resolved retry/cooldown, hidden-page polling and false-stale cases.

Production checks: all14destinations returned forecast data with7days through MET Norway, all14Arabic PDF assets returned `application/pdf` and valid PDF bytes, BlackForest history returned12months. UI checks covered auto-rotation, interaction pause, region-to-book links, saved reading, mobile390px and200% text. Device/camera hardware and live optional generative AI remain unverified without hardware/configuration.

## Optional local environment values

An empty environment is sufficient to explore and create local email/password accounts. For a compiled Worker, place local values in `dist/server/.dev.vars` after building, next to its generated Wrangler config, or use an explicit Wrangler environment-file option. Do not assume the root `.env` example is copied into that generated directory. Build output is regenerated; keep your own private backup of local settings outside tracked source.

Export validation: all tracked source bytes matched the published commit; ZIP integrity passed; all90 PDFs are present. The bundled local migration command was executed successfully in a separate extracted copy and applied all4 migrations to a new local database.

## Session 2026-09-18 — globe core, area view, imagery providers, UAE focus

State at handoff (all checks green: TypeScript clean, lint 0 errors, 336 tests, production build passing):

- `/` renders `components/globe-home.tsx`: globe + prompt, hidden chrome drawer, floating overview chips, cited assistant with selectable AI providers (`lib/ai-providers.ts`, `GET/POST /api/assistant`).
- Selecting a place locks the globe (`locked` prop of `components/globe-surface.tsx`, render-on-demand loop) and opens `components/area-view.tsx`: tile layers from `lib/area-layers.ts` (Esri, OpenTopoMap, NASA GIBS; paid Google/Mapbox via `app/api/tiles/route.ts` and `lib/tile-providers.ts`), drag/zoom/click, markers, Google Earth and Street View links, and the angled scene (`lib/area-scene.ts`) with life and essentials icons that ask the assistant.
- Environment: `AI_*` and `IMAGERY_GOOGLE_KEY` / `IMAGERY_MAPBOX_TOKEN` / `IMAGERY_DEFAULT` (see `.env.example`, README "Imagery for the area view"). Local values live in the root `.dev.vars` (ignored by git, LF endings). Production secrets belong in the Sites host environment; `wrangler secret put` does not apply (no root Wrangler config).
- Runtime lessons: Cloudflare fetch rejects `redirect: 'error'` (use `manual`); GIBS returns 200 all-black tiles for days without imagery (detected client-side); Google returns 404 above local coverage (filled with Esri tiles, credited).
- Tests added: `tests/area-layers.test.mjs`, `tests/area-scene.test.mjs`, `tests/tile-providers.test.mjs`.
- Next scope: UAE only. The plan, requirements, place list, per-place data fields and the research workflow design are in `docs/uae-plan.md`. Nothing of that research has run yet; the scope decision (flag vs archive) is open.
- Backups: `backups/daroub-before-imagery-providers-*.zip` (pre-imagery snapshot, ignored by git).
