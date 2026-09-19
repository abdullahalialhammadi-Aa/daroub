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
- **UAE focus (2026-09-18).** `lib/region.ts` sets `FOCUS_COUNTRY = 'AE'`: every destination carries an ISO `country`; `applyFocus` archives the 11 world places in the compiled seed and in every served snapshot (`readCatalog`), so the globe, lists, mention matching, fieldbook and planner show the 12 UAE places only while saved trips and shared links to world places keep resolving. Editorial flows read the unfiltered snapshot (`readCatalog({focus:false})`). Set `FOCUS_COUNTRY` to `null` to restore the world with no data change. Terrain category links resolve to UAE anchors (`terrainAnchor`); the angled scene uses UAE species examples (`lifeExamples`).
- 23 source-linked destinations in the catalogue, 12 active: liwa, jebel-jais, jubail-mangrove (enriched with sourced species and a rules chapter in `lib/uae/enrich.ts`) plus nine researched places in `lib/uae/*.ts` — jebel-hafeet, hatta, mleiha, al-marmoom (desert/mountain), sir-bani-yas, ras-al-khor, dibba-snoopy-island (coast), wadi-wurayah (mountain, access regulated — the text says so) and mushrif-ghaf-woodland (the UAE "forest": a native ghaf woodland, stated honestly). Each has nine cited chapters (incl. `rules` with the 999/998/997 emergency numbers), 3–6 species with `local`/`terrain-example` coverage, place-specific packing rules and an official further-reading reference. `tests/uae-catalog.test.mjs` validates every module; `tests/uae-focus.test.mjs` validates the focus.
- Globe auto-rotates at 8 degrees/second unless reduced motion is enabled; user control pauses it.
- Trips, packing suggestions, private inventory, itinerary, shared group preparation and invitations.
- Email/password accounts with one-time recovery codes; ChatGPT remains an alternative. No email sender or CAPTCHA configured. Do not claim email verification.
- Owner-scoped D1 records with revisions/operation IDs and account-scoped IndexedDB synchronization. Conflicts remain recoverable copies.
- Weather: Open-Meteo primary, MET Norway forecast fallback, separate historic monthly requests, explicit provider/timestamps/missing values/stale cache. Honor provider cooldowns and visible-page polling.
- Dedicated `/fieldbook?destination=...` reader, PDF downloads, official further-reading sources and saved offline reading. 135 PDFs: 23 destinations plus 4 general terrain guides, each in 5 languages (the nine UAE editions are dated 2026-09-18; `scripts/build-fieldbooks.py --only id,id --date YYYY-MM-DD` rebuilds a subset and merges the manifest). Free coordinates must not imply verified local species or destination information.
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

`.env.example` documents optional settings. Keep AI keys server-side. Empty DAROUB_OWNER_IDS/DAROUB_EDITOR_IDS grant no editorial roles. `oai-authenticated-*` header identity is honoured only when `DAROUB_CHATGPT_SITES=true` (set it in the Sites runtime and in `dist/server/.dev.vars` for the compiled suites); on Cloudflare Workers or any other host it stays unset and only email/password sessions sign in. Password-account emails have not been externally verified and must not automatically link to ChatGPT identities by matching email.

## Books

Existing PDF files work as static assets; Python is not required to run/build the website. To regenerate them, inspect `scripts/export-fieldbook-data.mjs` and `scripts/build-fieldbooks.py`. The latter needs reportlab, uharfbuzz, arabic-reshaper and python-bidi, plus Arial/Nirmala/YaHei fonts or adapted licensed font paths. It currently uses a fixed edition date; update the date deliberately for a new publication. Preserve shaping/RTL and visually inspect Arabic, Hindi and Chinese output.

## Most recent verification

2026-09-19 (Cloudflare deploy + header hardening): `getChatGPTUser` now ignores `oai-authenticated-*` headers unless `DAROUB_CHATGPT_SITES=true`; 348/348 unit tests, `tsc` clean, `npm run build` passed; compiled suites re-run on the rebuilt Worker (`test-worker` 13/13, `compiled-team` 57/57, `compiled-readonly` passed). Live smoke test on https://daroub.daroub.workers.dev: `/` 200 with Arabic title, `/api/catalog` 23 destinations / 12 active (all `AE`), forged-header `/api/session` → `null` and `/api/editor` → 401, `/fieldbooks/jebel-hafeet-ar.pdf` → `application/pdf`, `/register` 200.

2026-09-18 (UAE focus): 348 unit tests passed (`node --test tests/*.test.mjs`, rerun after the production build for the emitted-asset checks); `npx tsc --noEmit` clean; lint 0 errors (15 pre-existing image warnings); `npm run build` passed. Compiled Worker with migrated local D1: `scripts/test-worker.mjs` 13/13 checks, `tests/compiled-team.mjs` 57/57 checks (shared planner boards), `tests/compiled-readonly.mjs` passed on its isolated fixture. On Windows both compiled suites were run against the direct workerd socket (Wrangler's outer proxy resets connections after rejected request bodies, as the README notes) with keep-alive disabled — `node --import <preload that sets an undici Agent with pipelining 0 and no keep-alive> tests/compiled-team.mjs` is what made the team suite deterministic. `/api/catalog` on the compiled Worker returned 23 destinations with exactly the 12 UAE places active; `/`, `/regions?destination=hatta`, `/fieldbook?destination=mushrif-ghaf-woodland` and `/trips` at 390 px rendered without console errors and without world-place names. Hatta's guide showed live Open-Meteo data.

Earlier (release 14): 322 distinct tests passed; TypeScript and build passed; lint had 0 errors and 13 image warnings. Independent weather review resolved retry/cooldown, hidden-page polling and false-stale cases.

Production checks (release 14): all 14 destinations returned forecast data with 7 days through MET Norway, all 14 Arabic PDF assets returned `application/pdf` and valid PDF bytes, Black Forest history returned 12 months. UI checks covered auto-rotation, interaction pause, region-to-book links, saved reading, mobile 390 px and 200% text. Device/camera hardware and live optional generative AI remain unverified without hardware/configuration.

## Cloudflare Workers deployment (free plan)

Config: `handoff/wrangler.production.json` (Worker `daroub`, D1 `daroub` id `8cbace2c-9b9f-4045-807f-48c3d40f34cb`, assets `dist/client`, migrations from `drizzle/`). Account `60cf5de4caf7f5a58a36e221d4f9a636`, workers.dev subdomain `daroub` → https://daroub.daroub.workers.dev. Deploy flow after `wrangler login`: `npm run build` → `npx wrangler d1 migrations apply daroub --remote --config handoff/wrangler.production.json` → `npx wrangler deploy --config handoff/wrangler.production.json`. `DAROUB_CHATGPT_SITES` is intentionally unset there (email/password sign-in only). Editorial roles: `npx wrangler secret put DAROUB_OWNER_IDS --config handoff/wrangler.production.json` with the local-account user ids. Custom domain: add the zone to Cloudflare, then add a `routes` entry with `custom_domain: true` to the config and redeploy.

Globe core fixes shipped after the first deploy: the NASA credit is `pointer-events:none` and pinned top-end with a specificity guard (`components/globe-home.css`) — it used to stretch over the whole globe in the production bundle and swallow drags; the terrain chip opens a listbox that switches the selected point's terrain (kept in the `terrainId` URL param even with a destination — `lib/explorer-location.ts`); the group chip shows `suggestedGroupSize()` from `lib/group-size.ts` (terrain defaults, per-place overrides, optional editorial `Destination.groupSize`), which also seeds `newTrip().groupSize`. Tests: `tests/group-size.test.mjs`.

Second round of globe-core fixes: every `globe-home.css` override is written as `.orbital-page.globe-core …` because the production bundle emits `globe-dashboard.css` after it (that order made the hidden nine-button control bar reappear on phones and stack over the chips); on narrow stages the chips are a 2×4 band under the globe and the stage reserves `--gc-row-h` for it (nothing floats over the globe any more); the area pane drops its transform transition while a drag settles (`gc-settling`), so the map no longer slides back after a pan; markers are picked in screen space — the nearest visible marker within `max(14px, 3% of the stage)` wins, far-side markers are ignored, and the cursor turns to a pointer over a marker. Browser checks (need Chrome + playwright-core, see file headers): `node scripts/device-check.mjs <origin>` (six viewports: layout, drag, lock/reset, gesture hint, suggested-question flow) and `node scripts/marker-check.mjs <origin>` (all 12 UAE markers picked exactly).

Third round: a gesture hint (`.gc-gesture-hint`, copy key `gestureHint`) fades in 1.2 s after load as a quiet pill — under the chip ring on wide stages, between the globe and the chip band on phones — and unmounts at the first pointer/keyboard touch on `.globe-canvas` or when a place locks; it is `pointer-events:none` and stays visible (no fade) under `.reduce-motion`. Focusing the empty prompt opens `.gc-suggest` (a `role=listbox` above the field; the input is a `combobox`) with six ready questions built by `suggestedQuestions`/`suggestedQuestion` in `lib/globe-dashboard-copy.ts` — each names the selected place (or its terrain for a free point) and carries its assistant topic; picking one fills the field, and Send calls `ask(text, topic)` so the answer card opens for that topic. Arrow keys move through the options, Escape/outside click/typing close the list.

## Optional local environment values

An empty environment is sufficient to explore and create local email/password accounts. For a compiled Worker, place local values in `dist/server/.dev.vars` after building, next to its generated Wrangler config, or use an explicit Wrangler environment-file option. Do not assume the root `.env` example is copied into that generated directory. Build output is regenerated; keep your own private backup of local settings outside tracked source.

Export validation (release 14): all tracked source bytes matched the published commit; ZIP integrity passed; all 90 PDFs were present. The bundled local migration command was executed successfully in a separate extracted copy and applied all 4 migrations to a new local database.

## Session 2026-09-18 — globe core, area view, imagery providers, UAE focus

State at handoff (all checks green: TypeScript clean, lint 0 errors, 336 tests, production build passing):

- `/` renders `components/globe-home.tsx`: globe + prompt, hidden chrome drawer, floating overview chips, cited assistant with selectable AI providers (`lib/ai-providers.ts`, `GET/POST /api/assistant`).
- Selecting a place locks the globe (`locked` prop of `components/globe-surface.tsx`, render-on-demand loop) and opens `components/area-view.tsx`: tile layers from `lib/area-layers.ts` (Esri, OpenTopoMap, NASA GIBS; paid Google/Mapbox via `app/api/tiles/route.ts` and `lib/tile-providers.ts`), drag/zoom/click, markers, Google Earth and Street View links, and the angled scene (`lib/area-scene.ts`) with life and essentials icons that ask the assistant.
- Environment: `AI_*` and `IMAGERY_GOOGLE_KEY` / `IMAGERY_MAPBOX_TOKEN` / `IMAGERY_DEFAULT` (see `.env.example`, README "Imagery for the area view"). Local values live in the root `.dev.vars` (ignored by git, LF endings). Production secrets belong in the Sites host environment; `wrangler secret put` does not apply (no root Wrangler config).
- Runtime lessons: Cloudflare fetch rejects `redirect: 'error'` (use `manual`); GIBS returns 200 all-black tiles for days without imagery (detected client-side); Google returns 404 above local coverage (filled with Esri tiles, credited).
- Tests added: `tests/area-layers.test.mjs`, `tests/area-scene.test.mjs`, `tests/tile-providers.test.mjs`.
- Next scope: UAE only. The plan, requirements, place list, per-place data fields and the research workflow design are in `docs/uae-plan.md`. Nothing of that research has run yet; the scope decision (flag vs archive) is open.
- Backups: `backups/daroub-before-imagery-providers-*.zip` (pre-imagery snapshot, ignored by git).
