# Daroub — UAE focus: plan, requirements and data needs

Recorded 2026-09-18. From here on the product focuses on places in the United Arab Emirates. This file is the working plan for that scope and the brief for the next agent or teammate. It complements `AGENT_HANDOFF.md` (implementation state) and `README.md` (operations).

## 1. Where the product stands

- `/` is the globe core: the 3D globe plus one prompt. Site chrome is hidden behind the menu button. The assistant answers with cited guide text; Grok, Codex (OpenAI) and Claude are selectable "wording" providers when their keys are set (`AI_*` variables; keys never reach the browser).
- Selecting a place locks the globe and opens the area view (`components/area-view.tsx`): a tile map centred on the place with four key-free layers (Esri World Imagery, OpenTopoMap trail map, NASA ASTER relief, NASA MODIS "sky yesterday") and paid layers through the Worker proxy `app/api/tiles/route.ts` (Google Map Tiles satellite when `IMAGERY_GOOGLE_KEY` is set, Mapbox when `IMAGERY_MAPBOX_TOKEN` is set). Drag pans, wheel and buttons zoom, clicking moves the focus, markers select catalogue places, links open Google Earth and Street View at the spot.
- At zoom 15 or on demand the imagery tilts into the angled scene (`lib/area-scene.ts`): icons of the terrain's life (catalogue species first, then educational examples) and essentials; each icon asks the assistant about that topic.
- Eight floating chips give the quick overview of the selected place (weather, local time, terrain, equipment, nature, precautions, group, guidebook) when the scene is off.
- Checks at the time of writing: TypeScript clean, lint 0 errors, 336 tests passing, production build passing. Google satellite tiles verified live with the operator's key on the local dev server.

## 2. Scope decision for the UAE

Two ways to focus the product; the second is recommended for a first UAE release.

1. Region flag: a `DAROUB_REGION=uae` value that filters `activeDestinations()` to UAE entries, keeps world content in the seed for later.
2. Archive: mark every non-UAE destination `archived: true` in `lib/catalog-seed.ts`; the globe, lists, mention matching and the fieldbook then show UAE places only. Reversible with one edit; tests in `tests/catalog-content.test.mjs` that count destinations must be updated.

Not done yet: this is a product decision to confirm with the owner before applying.

## 3. UAE places

Existing in the catalogue (thin data, one or two species each):

| id | Name | Emirate | Terrain | Coordinates |
|---|---|---|---|---|
| liwa | Liwa Oasis | Abu Dhabi | desert | 23.140, 53.780 |
| jebel-jais | Jebel Jais | Ras Al Khaimah | mountain | 25.954, 56.151 |
| jubail-mangrove | Jubail Mangrove Park | Abu Dhabi | coast | 24.543, 54.485 |

Proposed additions (to research, then seed):

| Place | Emirate | Terrain | Why |
|---|---|---|---|
| Jebel Hafeet and Green Mubazzarah | Abu Dhabi (Al Ain) | mountain | Road summit, hot springs, easy family access |
| Hatta (dam, wadis, Hatta Wadi Hub trails) | Dubai | mountain | Marked hiking and biking trails, camping |
| Mleiha (Fossil Rock, archaeology centre) | Sharjah | desert | Guided desert activities, camping, heritage |
| Al Marmoom Desert Conservation Reserve and Al Qudra Lakes | Dubai | desert | Cycling track, birdlife, regulated camping |
| Sir Bani Yas Island (Arabian Wildlife Park) | Abu Dhabi | coast | Oryx, gazelle, cheetah; guided only |
| Wadi Wurayah National Park | Fujairah | mountain | Freshwater wadi, protected; access rules matter |
| Ras Al Khor Wildlife Sanctuary | Dubai | coast | Flamingos, hides, free entry, strict rules |
| Dibba and Snoopy Island shore | Fujairah | coast | Snorkelling, sea conditions |

Forest terrain: the UAE has no forest in the app's sense. Options: present ghaf woodland (Mushrif Park, Al Ain) as the UAE "forest" example, or hide the forest terrain for the UAE scope. Decision pending.

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

1. Confirm the scope decision (section 2) and the forest question (section 3).
2. Run the research workflow (designed, not yet run): one researcher per place plus one for cross-cutting conditions, official sources only, structured output with a source URL for every claim; then one skeptic per terrain group that refutes unsupported claims. Output `data/uae-plan.json`.
3. Translate approved English text into the other four locales (separate pass; keep Arabic first and reviewed by a native speaker).
4. Seed the catalogue: entries, sources with `reviewedAt`, species with coverage flags, packing rules; run `node --test tests/*.test.mjs`, `npx tsc --noEmit`, `npm run lint`, `npm run build`.
5. Tailor the scene examples to UAE species; update the copy keys; re-run tests.
6. Images: obtain licensed photographs per place or keep illustrative terrain images with the existing disclaimer.
7. Deployment: add `IMAGERY_GOOGLE_KEY` (and optionally `IMAGERY_DEFAULT=google`) in the Sites host environment; Google requires its copyright text (already shown) and possibly the Google logo next to it; every tile request is billed.

## 7. Open decisions for the owner

- Scope mechanism (flag or archive) and whether world content stays reachable.
- Forest terrain in the UAE scope.
- Google logo placement and tile budget.
- Whether species names should include scientific names in the UI.

## 8. Operational notes carried over

- Production is deployed by the Sites hosting platform, not by Wrangler from a workstation; secrets go into the host's environment settings.
- The Cloudflare runtime rejects `redirect: 'error'` on fetch; all outbound fetches use `redirect: 'manual'`.
- `.dev.vars` must be saved with LF line endings; keys are trimmed server-side anyway.
- A pre-change backup of the project exists in `backups/` (ignored by git).
