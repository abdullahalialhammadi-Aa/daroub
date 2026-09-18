# START HERE — Daroub project export

Exported 2026-09-18 from the published source revision:
a36be21721e3a2ada7f8c8d5c435acdbf96f054e

## Open in another agent app

1. Extract the ZIP.
2. Open the extracted `daroub` folder as the project/workspace.
3. Ask the agent: "Read START_HERE.md and AGENT_HANDOFF.md, install the locked dependencies, initialize the local database, and run Daroub locally."

## Requirements

Node.js 22.13 or newer with npm. Internet is needed for the initial dependency installation and live weather. No Sites/Codex plugin is required to edit or run the local project. A clean extraction automatically uses its portable execution profile.

Run these commands from the extracted `daroub` folder:

```sh
npm run install:ci
npx wrangler d1 migrations apply DB --local --config handoff/wrangler.local.json --persist-to .wrangler/state
npm run dev
```

Open http://localhost:5173 (or the URL printed by the terminal). Keep the development server bound to your own computer. Development ChatGPT sign-in uses a local test identity; it does not sign into the real ChatGPT service.

## Production build preview

Stop the development server, then run:

```sh
npm run build
npm start
```

Use the local URL printed by Wrangler. The local database initialized above uses the same `.wrangler/state` persistence directory. Email/password registration and recovery codes use local D1; real ChatGPT login requires the Sites authentication gateway.

## Checks

```sh
npx tsc --noEmit
npm run lint
node --test tests/*.test.mjs
```

Run tests after building to include the emitted-asset checks. Dedicated compiled-worker scenarios in `tests/compiled-*.mjs` may need their documented local fixtures; do not run synthetic-identity tests against production.

## Included / excluded

Included: application and server source, frozen npm lockfile, local build helpers, images, all 90 PDF fieldbook editions, tests, D1 schema and four migrations, source/reference data, and hosting configuration.

Excluded: installed dependencies, generated build folders, Git history, local worktrees, credentials, browser data and live database records. This is the full editable source, not a backup of users' accounts or saved trips. Existing public catalog content embedded in source is included; production-only editorial changes would need a separate data export.

## Hosting elsewhere

The server targets Cloudflare Workers with D1. Another coding agent app can edit and run it without being the deployment host. Deploying to a different host requires adapting the Worker/D1 and authentication integrations.

`.openai/hosting.json` preserves the existing Daroub Site identity for authorized updates. Its project ID is not a credential. Do not deploy a separate copy over the original Site. Configure a separate deployment and database for an independent installation.

See AGENT_HANDOFF.md for the current implementation and important integration details. The original README remains included but some older feature summaries there describe previous releases.
