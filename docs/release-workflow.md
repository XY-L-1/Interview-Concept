# Website delivery and personal preparation

The learning application is linked to the existing Vercel project interview-concept and GitHub repository XY-L-1/Interview-Concept. Production uses main. Work on a task branch, run the quality checks, and review the changes before merging.

## Quality checks

Use Node.js 24 and npm ci. npm run verify runs the unit tests, ESLint, TypeScript, and the production build. The GitHub Actions workflow runs this command for pull requests and pushes to main or codex branches. Vercel's project build command is also npm run verify, so a failed check prevents that deployment from becoming ready.

The Git integration creates branch previews and production deployments from main. It handles deployment authentication; the quality workflow does not need Vercel credentials. A successful local build is only local evidence. Check the GitHub run, Vercel deployment state and commit, and deployed routes when reporting a release.

## Public learning content

The backend systems course uses an anonymous translation workflow to teach requests, Kafka, concurrency and reliability. Its numeric examples are teaching assumptions. They do not describe any employer's measured traffic or internal architecture. English technical answers explain concepts; they do not establish the learner's personal implementation history.

## Personal preparation data

The /prepare page is a browser-local workspace. The website ships the tools and role lenses, without an embedded personal profile. Import a schemaVersion 1 JSON file to use personal facts, project stories and company context. Data is saved in that browser's localStorage and can be exported or cleared. It is not uploaded or synchronized between devices; this is not an authenticated cloud vault. Use a trusted browser profile and retain an exported backup if needed.

Keep personal exports outside this public repository. In the Interview workspace, the private seed is stored under .private/ and excluded from the outer repository. Never add it to published-content, public/, test fixtures or a deployment upload.

Stable profile facts retain their source, evidence status and contribution scope. Company and role context changes the emphasis, transitions and follow-up questions. It must not change historical facts or convert team behavior or an unverified claim into a personal accomplishment.

The first private seed distinguishes the user's confirmed participation and team workflow from earlier analysis that still needs original-code checks. Review a candidate contribution and its evidence before changing its status. A role template is a writing aid, not verification of the underlying experience.

## Restoring existing material

The Java/Spring guide is imported by `scripts/import-java-guide.mjs` into a typed
public snapshot, with eight courses and 160 questions. Original bilingual blocks
and source hashes are retained; correction notices are separate from the source.
The external Markdown is needed only to regenerate or locally verify fidelity,
not to build or deploy the committed snapshot.

The old Interview Studio is restored at `/prepare/studio`. Its complete private
bundle stays outside this repository. Only generic runtime assets are published.
Use real personal bundles on localhost for QA and fictional bundles on deployed
origins. Verify story state, locked introduction, timer, quiz, save/reload, export,
and clear after drafts have been written; ensure clearing does not resurrect
progress through iframe teardown handlers. Old file:// progress is imported
through the corresponding panel's existing progress transfer controls.
