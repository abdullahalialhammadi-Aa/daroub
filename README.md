# Daroub — terrain exploration and trip preparation

Arabic-first website with English, French, Chinese and Hindi coverage. Built with the existing React/Vinext framework and deployed as a Cloudflare Worker through Sites. Standard anchor navigation is intentional: it avoids the production RSC navigation failure in the pinned framework version.

## Included

- Four terrain categories and separate sourced destination records for Liwa, Jebel Shams, Black Forest and Hurghada. Local facts are separated from general terrain advice and illustrative species examples.
- Search, coordinate entry, bookmarks, shareable destination URLs, back/reload preservation, globe focus/reset and a searchable alternative to WebGL. Optional on-device camera hand control.
- Trips with dates, group size, transport, notes, day-by-day itineraries, local times and zones, quantity-based packing, duplication, deletion, JSON import/export and self-contained itinerary downloads.
- Reusable private gear inventory with conditions, maintenance/expiry dates, archiving and trip assignment. Versioned rules explain packing suggestions; acceptance and dismissal are explicit. Ownership, assignment and packed quantities stay separate.
- Owner/editor destination maintenance with drafts, five-language review, preview, version history and audited content rollback. Published destination IDs remain available for existing trips.
- ChatGPT authentication and owner-scoped D1 synchronization. Account-scoped IndexedDB copies, operation receipts, optimistic revisions, recoverable conflict copies and reconnect retries.
- Current weather and seven-day forecasts fetched separately from previous-calendar-year monthly averages. Units, timestamps, partial failures and stale data are visible.
- Structured plant/animal entries, encounter precautions, source links and review dates. Accessible fieldbook readers, self-contained HTML downloads and explicitly saved offline guides.
- Structured, cited destination guide retrieval in all five languages. Optional server-only generative provider adapter. Generated supplements are clearly unverified and cannot create or change trips automatically.
- Web Bluetooth Heart Rate service parsing, contact checks, connection recovery, stale states, sustained threshold alerts and notification controls. Readings stay in memory.
- RTL, keyboard globe controls, skip link, focus visibility, reduced motion, contrast mode and 100–200% text controls. These target WCAG 2.2 AA; no independent conformance certification is claimed.

## Data and offline behavior

The D1 records and sync_receipts tables enforce ownership using the authenticated account on every operation. Browser account headers must match the authenticated user. Mutations require a same-origin JSON request. No client-supplied owner is trusted.

D1 is authoritative. Local edits are queued under their account and replayed with operation IDs and revisions. Conflicting writes create recoverable copies instead of overwriting another edit. Sign-out clears private IndexedDB records and pending changes from this device; export unsynced work before signing out. Public saved guides remain available.

The service worker stores only the small public offline shell. Authenticated API responses and private server-rendered pages are not cached. Explicitly saved guides are stored in IndexedDB. The offline shell reads account-scoped trip and gear copies and supports quantity, inventory and itinerary changes; reconnect to synchronize. Upgraded private records use daroub-preparation-v2; old pending operations retain their receipt identity during migration. Malformed legacy data remains untouched and has an account-scoped recovery download on the Offline guides page. R2 is unused.

## Local development and checks

Requires Node.js 22.13+ and the frozen package lockfile.

```sh
npm run install:ci
npm run dev
npx tsc --noEmit
node --test tests/*.test.mjs
node scripts/test-sync.mjs
node scripts/test-client-sync.mjs
npm run build
npm start
```

Generate D1 migrations with npm run db:generate and inspect them before publishing. drizzle/0000_mushy_barracuda.sql establishes synchronization; the additive 0001_careful_lockheed.sql creates catalog drafts, immutable versions and the publication head. Build output includes the Worker, public assets, logical hosting bindings and migrations. Local worktree copies and build artifacts are excluded from root TypeScript and lint discovery.

## Editorial permissions and recovery

Configure DAROUB_OWNER_IDS and optionally DAROUB_EDITOR_IDS as server-only comma-separated verified ChatGPT Site user IDs. Empty values grant no editing access; there is no first-user administrator bootstrap. Editors save drafts; owners publish and restore content. The existing Site audience remains independent of these roles. Catalog snapshots are limited to 1,500,000 UTF-8 bytes in addition to field/count limits.

Set DAROUB_READ_ONLY=true and redeploy the compatible saved version to pause server mutations without changing private records, receipts or catalog content. Reads, exports and local drafts remain available. Set it back to false and redeploy to resume. See docs/recovery.md. Do not redeploy an earlier protocol-1 backend once v2 records exist.

Additional production checks: node scripts/test-worker.mjs against a migrated local compiled Worker with owner-a/editor-a allowlists; node tests/compiled-readonly.mjs runs an isolated recovery fixture. No authentication bypass belongs in a production build.

## Interactive planning and group packing

The home launcher opens a trip draft with a destination, activity and group size; those choices survive sign-in. The trip overview offers a scenario preview and a separate shared packing board. Scenario changes remain local to the preview until explicitly applied, and then require the normal trip save. Suggestions use the published catalog and preserve manual checklist entries, packed quantities and inventory links.

Shared boards require sign-in and a connection. Only the trip title, checklist labels and required quantities are projected from a reviewed, synchronized server revision. Private notes, health data, equipment inventory and private packing progress are excluded. Owners manage participants and invitations; members can change only their own allocations. Invites expire after seven days and are revoked on renewal, explicit revocation, participant removal or board closure. The invitation secret is a URL fragment and only its hash is stored on the server. An invite grants access to the board, not the private trip.

Boards use revision-checked writes and visible-page polling every 15 seconds; conflicting edits require a refresh and explicit review rather than an automatic retry. They are not cached offline. Named placeholders do not acquire account permissions. Assigned quantities and packed quantities are distinct, with gaps and overassignment shown separately. Deleting a private trip does not close its board; the owner can close it from My group.

The additive migration `drizzle/0002_public_tony_stark.sql` adds shared boards. Run `node tests/compiled-team.mjs` against a local compiled Worker and migrated D1 (`DAROUB_TEST_ORIGIN` may select a loopback port). The script uses synthetic identities and refuses non-local origins. On Windows, Wrangler's outer proxy can fail after rejected request bodies; the same compiled suite passes through its direct app socket.

## Optional provider configuration

Three named providers can be configured side by side and the user picks one per request: Grok (AI_GROK_API_KEY, AI_GROK_MODEL; xAI's OpenAI-compatible API at https://api.x.ai/v1), Codex (AI_OPENAI_API_KEY, AI_OPENAI_MODEL; OpenAI chat completions at https://api.openai.com/v1) and Claude (AI_CLAUDE_API_KEY, optional AI_CLAUDE_MODEL defaulting to claude-opus-5; the Anthropic Messages API at https://api.anthropic.com/v1). The legacy AI_BASE_URL / AI_MODEL / AI_API_KEY trio remains available as a custom OpenAI-compatible provider, and AI_DEFAULT_PROVIDER (grok | codex | claude | custom) puts one first. Base URLs may be overridden with AI_GROK_BASE_URL / AI_OPENAI_BASE_URL / AI_CLAUDE_BASE_URL (HTTPS only). GET /api/assistant lists the configured providers as identifiers, labels and model names; keys and endpoints never leave the server, and an AI draft is labelled with the provider that wrote it. User opt-in is required before sending the question and selected guide context to that provider. Saved trip context has a separate opt-in and excludes trip titles, notes, place names, inventory and health data. Trip proposals require explicit review and fresh trip/catalog checks. Requests have time, size and best-effort per-user/isolate limits; this is not a distributed billing quota. With no credentials configured, the cited guide assistant remains useful immediately.

## Imagery for the area view

Selecting a place on the globe locks it and opens an area view: a north-up tile map centred on the place with a layer switcher, zoom, click-to-recentre and a link that opens the same spot in Google Earth. Four layers need no key: Esri World Imagery (high-resolution satellite, credit "Esri, Maxar, Earthstar Geographics"), OpenTopoMap (trail map, CC-BY-SA, credit "© OpenStreetMap contributors, SRTM · OpenTopoMap"), NASA ASTER GDEM shaded relief and NASA MODIS true colour of the previous day (both public domain, credit "NASA GIBS"). The browser fetches these tiles directly; only the coordinates of the viewed area are disclosed, as with the weather requests.

Paid imagery is optional and proxied by the Worker so keys never reach the browser. GET /api/tiles lists the providers whose key currently works (identifier, label, zoom limit, credit only); GET /api/tiles?provider=…&z=&x=&y= streams one tile and refuses cross-site callers, invalid coordinates and bursts above a best-effort per-client limit. Google Map Tiles API: set IMAGERY_GOOGLE_KEY to an API key from a Google Cloud project with billing enabled and the "Map Tiles API" enabled (restrict the key to that API). The Worker creates a satellite, hi-DPI session token, caches it until shortly before it expires and shows Google's copyright text for the visible area, as Google's policies require; add the Google logo to the credit line before going live if your agreement requires it. Mapbox: set IMAGERY_MAPBOX_TOKEN to an access token with the Raster Tiles scope; tiles come from mapbox.satellite at 2x. IMAGERY_DEFAULT (google | mapbox) puts one first; the first working paid provider is the default view, otherwise Esri imagery. Every tile request is billed by the provider; the browser keeps tiles privately for a day, shared caches never see them.

## External dependencies and limits

Apple Watch and most Wear OS devices need authorized native companions or vendor integrations; separate native applications are outside this release. Compatible BLE heart-rate devices can connect in supporting browsers. No external emergency, SMS, email or companion push service is configured. Browser health monitoring works only while the page is open and receiving readings. It is not a diagnosis or emergency service.

Physical watch connections, real camera gestures and live generative provider responses require hardware or credentials and remain unverified. Automated tests cover BLE parsing, sustained-alert timing, assistant fallback and mocked provider behavior. Weather uses Open-Meteo; live data needs connectivity. Guide information and group-size suggestions are contextual educational guidance, not a safety guarantee or exhaustive local biodiversity inventory.

Sources and image credits are exposed in the application. Landscape photos are marked as illustrative where they do not depict the exact selected destination.
