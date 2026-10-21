# Website delivery and personal preparation

The learning application is linked to the existing Vercel project interview-concept and GitHub repository XY-L-1/Interview-Concept. Production uses main. Work on a task branch, run the quality checks, and review the changes before merging.

## Quality checks

Use Node.js 24 and npm ci. npm run verify runs the unit tests, ESLint, TypeScript, and the production build. The GitHub Actions workflow runs this command for pull requests and pushes to main or codex branches. Vercel's project build command is also npm run verify, so a failed check prevents that deployment from becoming ready.

The Git integration creates branch previews and production deployments from main. It handles deployment authentication; the quality workflow does not need Vercel credentials. A successful local build is only local evidence. Check the GitHub run, Vercel deployment state and commit, and deployed routes when reporting a release.

## Public learning content

The backend systems course uses an anonymous translation workflow to teach requests, Kafka, concurrency and reliability. Its numeric examples are teaching assumptions. They do not describe any employer's measured traffic or internal architecture. English technical answers explain concepts; they do not establish the learner's personal implementation history.

## Personal preparation data

The /prepare hub, /prepare/profile editor, and /prepare/studio library require Supabase email login by the configured, confirmed owner. They automatically load private account data; normal use does not require importing JSON. The website ships generic tools and role lenses, without an embedded personal profile or Studio payload. Owner checks protect the private API, and PostgreSQL RLS limits access to the owner's seeded document rows.

Private documents use the keys profile, studio, and progress. Profile facts retain schemaVersion 1; database versions advance independently. Profile and story edits save explicitly with an expected version. A stale write returns 409 without overwriting the cloud content, and the in-memory draft remains available for backup or an explicit reload. Question states and Studio progress synchronize automatically; independent progress edits can merge, while conflicts on the same field require an explicit choice.

Keep personal seeds and exports outside this public repository. In the Interview workspace, private seeds are stored under .private/ and excluded from the outer repository. Never add them to published-content, public/, public test fixtures, or deployment assets. Provision private documents through the authorized database setup path, not by bundling them into the website. Do not place owner addresses, provider project identifiers, or credentials in public documentation.

Stable profile facts retain their source, evidence status and contribution scope. Company and role context changes the emphasis, transitions and follow-up questions. It must not change historical facts or convert team behavior or an unverified claim into a personal accomplishment.

The first private seed distinguishes the user's confirmed participation and team workflow from earlier analysis that still needs original-code checks. Review a candidate contribution and its evidence before changing its status. A role template is a writing aid, not verification of the underlying experience.

## Restoring existing material

The Java/Spring guide is imported by `scripts/import-java-guide.mjs` into a typed
public snapshot, with eight courses and 160 questions. Original bilingual blocks
and source hashes are retained; correction notices are separate from the source.
The external Markdown is needed only to regenerate or locally verify fidelity,
not to build or deploy the committed snapshot.

The old Interview Studio is restored at `/prepare/studio`. Its six original
stories, 31 behavioral questions, 94 foundation questions, and locked introduction
load from the private account document. Original drafts and incomplete states are
not promoted into verified profile facts. The complete private seed stays outside
this repository; only generic runtime assets are published. Use fictional data
for public or unauthenticated deployment tests. Personal-data checks must remain
inside the authorized owner session and private data service.

Verify story state, introduction, timer, quiz, cloud save/reload, progress
restoration, and conflict handling. Optional backup and legacy transfer controls
remain available. Clearing old browser caches must not delete cloud documents or
restore stale notes through iframe teardown handlers. Old file:// progress is
imported through the corresponding panel's existing progress transfer controls.
