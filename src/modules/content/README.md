# Content

Owns the public learning catalog and canonical editorial lifecycle: stable
course, section, and question identities with durable routing slugs and course
ownership; immutable course release trees; structured bilingual answer
revisions; review state; and publication pointers.

Catalog organization and editorial workflow remain distinct responsibilities,
but they start in one code module because publishing them consistently is one
transactional boundary. Split them only if ownership or scale later proves a
real need.

The current public reader resolves a stable course's publication pointer to an
immutable tree of ordered section and question revisions from a typed,
file-backed fixture. Routes import the module's explicit `index.ts` surface;
`public.ts` owns read operations and `ui/*` owns content-specific presentation.
A future PostgreSQL adapter can replace the fixture without changing route
consumers.
