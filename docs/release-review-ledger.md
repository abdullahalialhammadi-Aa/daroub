# Daroub preparation release: review evidence ledger

Prepared and updated 2026-09-17 by the content/recovery workstream. This is an evidence record, not release approval. It covers all 24 implementation Workforce assignments, the contract-format retry, and the native and browser checks identified below. The final immutable commit, deployment version and live acceptance evidence belong in the coordinator's release report.

## Provenance and meanings

The planning baseline is `outputs/daroub-next-release-plan.md`. Workforce evidence is in `work/release-workforce/wave{1,2,3,4}.json` and `work/release-workforce/results-wave{1,2,3,4}/<task-id>/result.json`, with aggregate `results.json` in each wave. The successful `acceptance-evidence` retry is recorded separately under `wave4-retry.json` and `results-wave4-retry/acceptance-evidence/result.json`; its original invalid response remains preserved. These local work artifacts are the primary delivery records; this document summarizes them without reproducing raw responses.

All 24 final assignment results report `state=finished`, `delivered=true`, `contract_valid=true`, `exit_code=0`, `error_message=null`, and `tool_calls=0`, counting the successful retry as the final result for `acceptance-evidence`. All 24 also have `accepted=null` and `acceptance_checks=[]`. There are 25 recorded attempts for 24 distinct assignments. A delivered, parseable review is therefore **not** an accepted implementation or a passed test. The workers analyzed supplied source/context bundles and proposed findings or test cases. They did not execute the repository tests, browse source links, certify translations or inspect a deployed browser session in these assignments.

Some Claude responses required removal of a Markdown JSON fence by the contract parser. That recorded normalization is not a correctness check or a failed assignment.

## Delivery register

| Wave | Task IDs | Delivery and contract | Executed checks in worker record |
|---|---|---|---|
| 1 — evidence and boundaries | `evidence-desert`, `evidence-mountain`, `evidence-forest`, `evidence-coast`, `edge-inventory`, `edge-dates`, `edge-packing`, `edge-import` | 8/8 delivered, 8/8 valid contracts; acceptance unset | None; suggestions/static analysis |
| 2 — languages and security | `locale-ar`, `locale-en`, `locale-fr`, `locale-zh`, `locale-hi`, `security-editor`, `security-sync`, `security-assistant` | 8/8 delivered, 8/8 valid contracts; acceptance unset | None; suggestions/static analysis |
| 3 — integration reviews | `review-content-url`, `a11y-keyboard-rtl`, `a11y-mobile-text`, `offline-upgrade`, `migration-rollback`, `regression-release` | 6/6 delivered, 6/6 valid contracts; acceptance unset | None; suggestions/static analysis |
| 4 — acceptance evidence | `production-journeys`, `acceptance-evidence` | 2/2 finally delivered with valid contracts; `acceptance-evidence` required one bounded contract-format retry; acceptance unset | None; source/evidence review only |

Wave 1 ran at concurrency 4 with one worker per lane, from 00:58:55 to 01:00:07 UTC. Wave 2 ran at concurrency 8 with two per lane, from 01:08:49 to 01:11:11 UTC. Wave 3 ran at concurrency 6, with a per-lane maximum of two, from 01:19:22 to 01:21:30 UTC. These are the aggregate recorded start/finish times on 2026-09-17. The record does not show sixteen simultaneous workers; wave 3 had only six independent assignments.

Wave 4 ran at concurrency 2 from 01:33:05 to 01:33:50 UTC. The single contract retry ran at concurrency 1 from 01:37:49 to 01:38:05 UTC. `production-journeys` used Copilot `gpt-5.6-sol`; `acceptance-evidence` and its retry used Claude `claude-sonnet-5`, all at medium effort. Their response metadata confirms the requested model identities. The first `acceptance-evidence` response was delivered with exit code zero but failed the contract with `Response is not a single JSON object`; literal unescaped newlines prompted a strictly bounded formatting retry. The retry returned a valid contract. This was a failed contract attempt, not an executed acceptance test.

## Provider identity and operational qualifications

| Lane | Requested binding | Response identity evidence | Qualification |
|---|---|---|---|
| Grok | `grok-4.6`, medium | `identity_match=null`, `aggregate_usage_only`; aggregate usage names `grok-4.6-build` | Actual assistant-response model not exposed; do not claim verified exact response identity |
| Ollama | CLI `glm-5.3:cloud`, low | `identity_match=null`, `not_exposed`; no response model metadata | Actual model identity unverified |
| Copilot | `gpt-5.6-sol`, medium | `identity_match=true`, `assistant_response_metadata`, response model `gpt-5.6-sol` | Response identity matches recorded request |
| Claude | `claude-sonnet-5`, medium | `identity_match=true`, `assistant_response_metadata`, response model `claude-sonnet-5` | Aggregate usage also lists `claude-haiku-4-5-20251001`; that is ancillary aggregate usage, not evidence of response substitution |

There is no undelivered assignment among the 24 final results; one earlier attempt failed its response contract as documented above. That does not mean every provider subprocess was warning-free. Grok stderr records failed initialization of unrelated configured MCP servers (authentication required and HTTP 405 handshake errors). `evidence-desert` and `review-content-url` also record a resident session actor failure; `review-content-url` records truncated session-title generation. The requested review responses still arrived with valid contracts and exit code zero. Ollama records nonempty stderr, including progress output. These warnings must not be recast as successful use of unavailable connectors. The blocked Claude Fable binding was not used. No subscription purchase or credit-reset action appears in this workstream.

## Material findings and their disposition

| Finding or proposal | Disposition and evidence |
|---|---|
| A legacy mutation can pass preflight and race a v2 upgrade before the atomic D1 batch | Accepted. `lib/sync-server.ts` guards the batch operations by schema compatibility and returns `UpgradeRequired` when no compatible receipt was produced. `tests/release-persistence.test.mjs` injects the upgrade between preflight and batch for edit and delete, asserting no receipt or extra recovery copy. Independently reproduced in the content workstream before the checked-in regression existed. |
| v2 tombstones could lose compatibility protection; changing protocol/replacement identity could reuse a receipt | Accepted. Server retains v2 tombstone metadata and includes the relevant v2 protocol/replacement identity in receipt hashing. Checked-in tests cover legacy delete rejection and mismatched receipt reuse. Previously acknowledged legacy operations still replay their original receipt. |
| Client-supplied draft base could bypass stale publication; a generic five-element array could be mistaken for localized text | Accepted. `lib/catalog-server.ts` preserves the established draft base; `lib/catalog-validation.ts` distinguishes actual localized fields from shared arrays. Tests cover forged rebase rejection and invalidating all language reviews for shared metadata edits. |
| Catalog rollback can strand destinations referenced by trips | Accepted during native integration review. `93b7b7f` preserves published identities, archives later destinations and remaps source collisions. Tests cover historical identities, editable trip references and rejecting oversized rollback before head/history mutation. |
| Malformed legacy pending/cached rows remain on disk but are not discoverable in the upgraded interface | Accepted (`offline-upgrade`). The chosen repair is read-only account-scoped recovery export, not writing unvalidated raw rows into the modern store. `8ecc51a` adds `lib/legacy-recovery.ts`, `components/legacy-recovery.tsx`, mounted in `components/offline-library.tsx`. Four tests verify malformed account-A rows only, unchanged originals, invalid mutation envelope detection, stale-export rejection and delayed session lookup after sign-out. |
| Old controlled clients can explicitly sign out after clearing only their legacy store | Accepted in native follow-up. `c971ae8` adds owner-scoped purge across both namespaces and a service-worker sign-out bridge using captured same-origin session identity. Tests verify other-account and public-guide preservation, concurrent writes, fail-closed lookup failure and no cleanup on ordinary session expiry. This cannot undo an already cached old script's own global legacy-store clear; coverage is explicitly for clients controlled by the updated worker. |
| Published catalog responses were only shallowly checked by the client | Accepted as defense in depth. The inspected integrated working tree calls `validateCatalog(..., true)` before replacing the active snapshot in `lib/catalog-client.tsx`; fetch/validation failure retains the available snapshot and shows the catalog notice. This edit was uncommitted at the inspection point and needs inclusion in the final release commit. |
| Keyboard focus may be lost when itinerary rows move/disappear; closed editor sections can hide invalid required inputs | Accepted in native UI review. `1e396d5` preserves focus and announces list changes. `ff53aa0` reveals invalid editor ancestors and avoids treating an empty latitude/longitude as zero. These source changes require final browser acceptance in addition to unit coverage. |
| General beach safety does not establish life-jacket equipment evidence | Accepted scope correction. The seed life-jacket rule cites NPS essentials, which explicitly includes activity-dependent equipment. NOAA beach material remains general coastal hazard guidance, not locally verified Hurghada wildlife or medical treatment. |
| Assistant actions can be stale despite the same server revision or after catalog publication | Accepted as a separate native concern. Proposal application checks trip content fingerprint, expected revision and catalog revision; callers recheck publication online and explicitly identify offline snapshot use. `9223d0a` and `tests/packing-assistant.test.mjs` cover the behavior. |

### Proposals not accepted verbatim

- `security-assistant` proposed incrementing the server revision locally after applying a proposal. Rejected: revisions belong to the authoritative synchronization server. The correct local stale-action check uses the trip content fingerprint plus fresh record comparison; inventing a revision would corrupt the optimistic base.
- `review-content-url` treated preserving the original destination for a terrain-index lookup as a defect. Rejected: legacy terrain URLs intentionally retain their original destination meaning. Stable destination IDs, search and globe selection support additional destinations; the catalog content tests include a fifth destination.
- `edge-dates` inferred that a 60-day-record limit requires offsets below 60. Rejected: the contract limits the number of itinerary day records, while sparse offsets have their own wider bound. Count limits and offset limits are separate constraints.
- `offline-upgrade` suggested copying raw failed-normalization payloads into the new cache/outbox. Rejected as an unsafe repair mechanism. Raw originals remain available through guarded recovery export; invalid data is not silently normalized or submitted as validated records.
- Source reviews do not establish universal water quantities, a minimum group size that guarantees safety, or locally verified species for arbitrary coordinates. Equipment quantities remain editable planning inputs, with general terrain advice distinguished from destination evidence.

The five language reviews produced useful terminology and consent/action wording suggestions. They are recorded suggestions, not native-speaker certification. The mobile/text reviewer worked from source rather than a rendered 320-pixel or 200% text session; layout concern alone is not evidence of a reproduced browser failure. Final browser checks remain the coordinator's responsibility.

### Final review disposition

`production-journeys` correctly identified the browser offline-edit/reload/reconnect path and rechecking the observed narrow-layout issue as gaps in the evidence bundle it received. These were accepted as release verification work. Subsequent coordinator browser execution, recorded below, exercised true network unavailability, a nested itinerary note and packing quantity, reload, reconnection, synchronization and a recovery import. The inventory and final English/Arabic trip narrow/enlarged-text corrections were rechecked successfully.

`acceptance-evidence` correctly required separation of native execution from external source review, and warned against claiming full WCAG certification, physical-device coverage or verified optional provider credentials. Its references to 22 completed assignments and pending browser journeys reflect the earlier evidence snapshot supplied in its prompt. They are superseded by the 24-result register and the later coordinator observations below, not by the reviewer having executed those checks itself. The immutable release and live publication evidence remain deferred to the release report.

## Executed native checks, distinct from Workforce delivery

Fresh integrated root execution during this ledger review:

```text
node --test tests/legacy-recovery.test.mjs tests/release-persistence.test.mjs tests/private-owner-cleanup.test.mjs tests/signout-worker.test.mjs
26 tests, 26 passed, 0 failed, 0 skipped
```

Root HEAD at inspection was `8ecc51a`, with coordinator changes present in `lib/catalog-client.tsx` and `lib/sync-server.ts`. The command exercised that working tree, not a clean immutable release artifact. These tests use simulated IndexedDB/service-worker and SQLite-backed D1 harnesses; they do not prove physical old-browser behavior or production-provider availability.

Earlier content-workstream executions (at the associated isolated commits, not a claim that all were rerun against the final release):

| Commit | Executed checks |
|---|---|
| `6573176` catalog/editor integration | 7 catalog-content tests; TypeScript; production framework build; lint with no errors (existing image warnings) |
| `306d101` offline preparation shell | 11 offline-shell tests covering quantities, account isolation, generation guards, conflict copies, itinerary and gear snapshots; lint |
| `4c9833e` private-owner cleanup | 4 private cleanup + 3 sign-out worker + 11 offline shell tests; TypeScript; lint |
| `e4356a2` malformed recovery | 4 recovery tests; TypeScript; lint |

Additional isolated read-only probes reproduced the preflight/batch race and legacy migration replay against then-current integrated source. The migration probe checked original operation replay, repeated migration idempotency, removal after acknowledgement and a late old-tab mutation while preserving the modern record. Those probes live under ignored `work/`; they are supplemental evidence rather than durable regression coverage. The coordinator's `tests/client-audit.test.mjs` and final release suites should remain the durable gate.

## Final integrated native and browser evidence

The coordinator reports the final integrated native run as **136 tests passed**, TypeScript passed, and ESLint **0 errors / 7 existing image warnings**. `work/release-tests.log` was inspected for this update and records 136 passed, 0 failed and 0 skipped. The coordinator also reports **13 compiled production Worker checks** against real local D1, covering primary routes, v2 equipment/trips, nested itinerary and partial quantities, legacy 426 rejection, owner isolation, origin/MIME validation and restricted editorial draft/review/publication/rollback. These are local compiled-runtime checks, not claims of live Site deployment.

The isolated compatible read-only recovery build `583931a1-567b-46de-8772-31078dd50ab4` passed **10 compiled checks**, as reported by the coordinator. `tests/compiled-readonly.mjs` covers readable sessions/catalog/private snapshots, other-account isolation, exact write rejection with HTTP 503 / `Retry-After: 300` / `no-store`, and unchanged stored records/receipts with no editorial writes. Recovery uses a compatible current artifact with `DAROUB_READ_ONLY`; restoring the old v3 backend against v2 data is not an accepted rollback procedure.

Later coordinator browser observations supersede the pending entries in the earlier `work/release-evidence-current.md` snapshot:

| Journey | Observed result and boundary |
|---|---|
| True offline edit, reload and reconnect | Proxy was stopped; packed quantity changed from 2 to 3 and a nested itinerary note was edited. Values survived offline reload, then synchronized after reconnection. `work/release-browser-server-evidence.json` confirms `tripCount: 1`, `revision: 5`, `packed: 3`, `required: 4`, `assigned: 4`, and `entryNote: "Offline itinerary note retained"`. A final server-evidence rerun after retry confirmed the same single original trip, revision and values; no duplicate trip was observed. This is one exercised end-to-end journey, not exhaustive proof of all reconnect interleavings. |
| Recovery import | Browser import created a new recovery copy successfully, as reported by the coordinator. |
| Languages and keyboard | English, Arabic, French, Chinese and Hindi interfaces were exercised; Arabic RTL and keyboard focus behavior were checked. This is functional UI evidence, not native-speaker certification or full assistive-technology coverage. |
| Narrow layout and enlarged text | The observed inventory overflow was fixed and rechecked at 320 pixels and 200% text. Final trip reflow was browser-verified in English and Arabic at a 320-pixel viewport with 200% text (32-pixel font): document width 305, measured overflow list empty; Arabic document language was `ar` with `dir=rtl`. |

These final figures and browser observations come from coordinator execution and the named local evidence artifacts. The external Workforce reviewers ran zero tool checks. This distinction remains unchanged after all 24 assignments completed.

## Release-report evidence still to record

- Final immutable release commit and association of the executed checks with the packaged release artifact.
- Any additional release acceptance results obtained after this ledger update.
- Published Site version, unchanged audience, live journey checks, source archive and compatible rollback/recovery artifact.
- External limitations: physical watch/camera coverage, real external alert dispatch and live generative provider credentials remain unverified unless separately exercised. Source links and ecological content need ongoing dated editorial review; an exportable guide is not a safety guarantee.

Do not turn this ledger into a blanket quality or WCAG conformance claim. It records which evidence exists, which suggestions were rejected or narrowed, and which release claims still need their own observation.
