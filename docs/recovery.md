# Compatible recovery and publication rollback

Preparation protocol 2 adds gear, numeric packing and nested itineraries. The previous release archive and Sites version are retained, but its old backend must not run against upgraded preparation records: it did not enforce protocol guards. Do not undo additive database migrations or restore old tables over new user data.

## Recover the application

1. Keep the verified preparation-release version and source archive available.
2. Set the server-side Sites variable `DAROUB_READ_ONLY=true`, preserving all other variables and the existing audience. Redeploy that compatible saved version.
3. Verify authenticated session `readOnly=true`; GET preparation/catalog/editor reads work; POST synchronization and editorial actions return the exact recovery error with status503, `Retry-After:300` and `Cache-Control:no-store`. They must produce no operation receipt and change no private or catalog record.
4. Users may read/export saved data and retain local pending edits. Do not sign them out or clear their storage as a recovery step.
5. Correct the faulty change against this schema, validate and publish. Set `DAROUB_READ_ONLY=false` and redeploy to resume bounded synchronization. Original operation IDs remain valid.

`tests/compiled-readonly.mjs` exercises this process against an isolated compiled Worker and actual local D1, including byte-for-byte unchanged records/receipts. It starts and stops only its own hidden helper. Physical browser/network behavior is checked separately in the release report.

## Restore published guidance

Owners can restore a catalog revision from the Destination editor. Restoration creates a new audited revision using expected-head checks. Destinations introduced later remain archived with their necessary sources so saved trips and destination URLs continue to resolve. Missing translations/sources, stale heads, immutable terrain changes or storage-limit violations fail without moving the publication head.

Content rollback does not change personal trip data. Previously downloaded guides stay pinned to their original content; updating them is explicit.
