# Daroub — UAE focus: plan, requirements and data needs

Recorded 2026-09-18. From here on the product focuses on places in the United Arab Emirates. This file is the working plan for that scope and the brief for the next agent or teammate. It complements `AGENT_HANDOFF.md` (implementation state) and `README.md` (operations).

## 1. Where the product stands

- `/` is the globe core: the 3D globe plus one prompt. Site chrome is hidden behind the menu button. The assistant answers with cited guide text; Grok, Codex (OpenAI) and Claude are selectable "wording" providers when their keys are set (`AI_*` variables; keys never reach the browser).
- Selecting a place locks the globe and opens the area view (`components/area-view.tsx`): a tile map centred on the place with four key-free layers (Esri World Imagery, OpenTopoMap trail map, NASA ASTER relief, NASA MODIS "sky yesterday") and paid layers through the Worker proxy `app/api/tiles/route.ts` (Google Map Tiles satellite when `IMAGERY_GOOGLE_KEY` is set, Mapbox when `IMAGERY_MAPBOX_TOKEN` is set). Drag pans, wheel and buttons zoom, clicking moves the focus, markers select catalogue places, links open Google Earth and Street View at the spot.
- At zoom 15 or on demand the imagery tilts into the angled scene (`lib/area-scene.ts`): icons of the terrain's life (catalogue species first, then educational examples) and essentials; each icon asks the assistant about that topic.
- Eight floating chips give the quick overview of the selected place (weather, local time, terrain, equipment, nature, precautions, group, guidebook) when the scene is off.
- Checks at the time of writing: TypeScript clean, lint 0 errors, 336 tests passing, production build passing. Google satellite tiles verified live with the operator's key on the local dev server.

## 2. Scope decision for the UAE

**Applied 2026-09-18 — a combination of both options.** `lib/region.ts` declares `FOCUS_COUNTRY = 'AE'`; every destination carries an ISO `country` (compiled ones via `destinationCountries`, new ones in their own record); `applyFocus` archives out-of-focus places in the compiled seed and in every served snapshot (`readCatalog`), so the globe, lists, mention matching, the fieldbook and the planner show UAE places only while saved trips and shared links to world places keep resolving (`archived` entries stay in the catalogue). Editorial flows read the unfiltered snapshot. Reverting to the world is one edit (`FOCUS_COUNTRY = null`) with no data change. Tests: `tests/uae-focus.test.mjs`.

The two options that were considered:

1. Region flag: a `DAROUB_REGION=uae` value that filters `activeDestinations()` to UAE entries, keeps world content in the seed for later.
2. Archive: mark every non-UAE destination `archived: true` in `lib/catalog-seed.ts`; the globe, lists, mention matching and the fieldbook then show UAE places only. Reversible with one edit; tests in `tests/catalog-content.test.mjs` that count destinations must be updated.

## 3. UAE places

**Seeded 2026-09-18.** The three existing places were enriched (`lib/uae/enrich.ts`: sourced species to 4–6 each, a `rules` chapter with permits/protected-area rules and the 999/998/997 emergency numbers, seven UAE packing rules such as a heat plan, sun protection, printed permits, 4×4 recovery gear for Liwa, a life-jacket/tide check for Jubail, warm wind layers for Jebel Jais). The eight proposed additions plus the forest example below were researched from official/operator pages that were actually fetched, and written in all five locales (`lib/uae/<id>.ts`, validated by `tests/uae-catalog.test.mjs`). Every chapter cites a source; numbers appear only when a source states them; unsourced advice is labelled as inference.

| id | Name | Emirate | Terrain | Coordinates |
|---|---|---|---|---|
| liwa | Liwa Oasis | Abu Dhabi | desert | 23.140, 53.780 |
| jebel-jais | Jebel Jais | Ras Al Khaimah | mountain | 25.954, 56.151 |
| jubail-mangrove | Jubail Mangrove Park | Abu Dhabi | coast | 24.543, 54.485 |
| jebel-hafeet | Jebel Hafeet and Green Mubazzarah (Jebel Hafit Desert Park) | Abu Dhabi (Al Ain) | mountain | see record |
| hatta | Hatta (dam, wadis, Wadi Hub trails, bike centre) | Dubai | mountain | see record |
| mleiha | Mleiha (national park, archaeological centre, Fossil Rock) | Sharjah | desert | see record |
| al-marmoom | Al Marmoom Desert Conservation Reserve and Al Qudra Lakes | Dubai | desert | see record |
| sir-bani-yas | Sir Bani Yas Island (Arabian Wildlife Park) | Abu Dhabi | coast | see record |
| wadi-wurayah | Wadi Wurayah National Park — access regulated, stated plainly | Fujairah | mountain | see record |
| ras-al-khor | Ras Al Khor Wildlife Sanctuary | Dubai | coast | see record |
| dibba-snoopy-island | Dibba / Al Aqah shore and Snoopy Island | Fujairah | coast | see record |
| mushrif-ghaf-woodland | Mushrif National Park ghaf woodland | Dubai | forest | see record |

Forest terrain: decided — the UAE has no temperate forest, so the native ghaf woodland of Mushrif National Park is the UAE `forest` example and its text says so. The terrain category link for "forest" resolves to it (`terrainAnchor` in `lib/region.ts`).

Known gaps recorded by the researchers: discovermleiha.ae could not be read by the fetcher (Visit Sharjah pages were cited instead); several Liwa and Jubail species are `terrain-example` because no fetched page documents them at the exact place; Hatta has one `local` species (its others are examples). Images remain the illustrative terrain photos with the existing disclaimer.

## 4. Data required per place (matches the catalogue shape)

Every field below exists in `lib/toolkit-types.ts` and is rendered by the app. All text fields need the five locales in this order: Arabic, English, French, Simplified Chinese, Hindi.

- Identity: `id`, `names`, `summary`, `terrainId`, `lat`, `lon`, `timezone` (`Asia/Dubai`), `image` and `imageIsIllustrative` (licence must allow reuse; credit in sources).
- Sections (`sections[]`, each with `sourceIds`): `place`, `deeper`, `hazard`, `visit`, `clothing`, `transport`, `season`, `equipment`, `nature`. Keep the existing tone: planning guidance, no guarantees, "check on the day".
- Species (`species[]`): `name`, `description`, `precaution`, `sourceIds`, `coverage` (`local` only when a source documents presence at that place; otherwise `terrain-example`). Target four to six per place, animals and plants, including hazards such as scorpions, snakes, jellyfish and heat-related risks where a source supports them.
- Sources (`sources[]`): `id`, `title`, `url`, `reviewedAt`. Official or operator sources only: Environment Agency Abu Dhabi, Ministry of Climate Change and Environment, National Center of Meteorology, Visit Abu Dhabi, Visit Dubai, Visit Ras Al Khaimah and Jebel Jais, Sharjah Environment and Protected Areas Authority, Fujairah Adventure Centre, Hatta and Mleiha operators, Dubai Municipality (Ras Al Khor), emergency guidance from the police and NCEMA.
- Packing rules (`packingRules[]`): UAE-specific additions such as heat plan, water volume per person per hour, sun protection, permit printouts, 4x4 recovery gear for dunes, tide tables for coast, warm layers for Jebel Jais nights.
- Scene examples (`lib/area-scene.ts`): replace the generic terrain examples with UAE species once sourced (for example Arabian oryx, sand gazelle, Arabian red fox, ghaf and samr for desert; Arabian tahr, Egyptian vulture, wild olive and sidr for mountain; greater flamingo, green turtle, grey mangrove, dugong for coast).

## 5. Cross-cutting UAE data

- Seasons and heat: NCM climate normals, month-by-month guidance, the summer heat rules used by authorities (midday break, heat index thresholds), sandstorm and fog advisories.
- Rules: camping permits and no-go zones by emirate, drone rules, protected-area regulations, wadi flash-flood warnings, Friday and Ramadan considerations for services.
- Emergency: 999 police, 998 ambulance, 997 civil defence; nearest hospitals per place.
- Weather feed: the app already calls Open-Meteo per selection; confirm coverage for each new coordinate.

## 6. Research and build steps (in order)

1. ✅ Scope decision (section 2) and the forest question (section 3) — applied.
2. ✅ Research: one researcher per place plus one for the three existing places, official/operator sources only, every claim with a fetched source; output is the typed modules in `lib/uae/` (not a JSON), each validated for five complete locales, nine cited chapters, 3–6 species, UAE coordinates and canonical packing-rule activities.
3. ✅ Five locales written together (Arabic first). Still recommended: a native Arabic review pass before the public UAE release.
4. ✅ Seed: `lib/catalog-seed.ts` composes `lib/uae/index.ts`; `node --test tests/*.test.mjs`, `npx tsc --noEmit`, `npm run lint`, `npm run build` pass (see AGENT_HANDOFF.md "Most recent verification").
5. ✅ Scene examples: `lib/area-scene.ts` `lifeExamples(terrain, focus)` — Arabian oryx, Arabian red fox, scorpion, ghaf, samr (desert); Arabian tahr, Egyptian vulture, saw-scaled viper, wild olive, sidr (mountain); ghaf, Arabian babbler, desert hedgehog, red fox, sidr (forest); greater flamingo, green turtle, dugong, grey mangrove, jellyfish (coast).
6. Images: still the illustrative terrain photos with the disclaimer; licensed place photographs remain open.
7. Deployment: add `IMAGERY_GOOGLE_KEY` (and optionally `IMAGERY_DEFAULT=google`) in the Sites host environment; Google requires its copyright text (already shown) and possibly the Google logo next to it; every tile request is billed.
8. ✅ Fieldbooks: 45 new PDFs (`scripts/build-fieldbooks.py --only … --date 2026-09-18`), manifest 135 editions; official further-reading references added for the nine places in `lib/official-region-books.json`.

## 7. Open decisions for the owner

- ~~Scope mechanism (flag or archive) and whether world content stays reachable~~ — applied: focus constant + archived world content (reachable through saved trips and links, hidden from lists).
- ~~Forest terrain in the UAE scope~~ — applied: Mushrif ghaf woodland.
- Google logo placement and tile budget.
- Whether species names should include scientific names in the UI.
- A native Arabic reviewer for the nine new places and the enrichment text before the public release.
- Cycling is now a selectable activity (`activityIds`); confirm the label wording in each locale.

## 8. Operational notes carried over

- Production is deployed by the Sites hosting platform, not by Wrangler from a workstation; secrets go into the host's environment settings.
- The Cloudflare runtime rejects `redirect: 'error'` on fetch; all outbound fetches use `redirect: 'manual'`.
- `.dev.vars` must be saved with LF line endings; keys are trimmed server-side anyway.
- A pre-change backup of the project exists in `backups/` (ignored by git).
