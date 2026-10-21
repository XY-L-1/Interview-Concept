# Local Studio runtime

This directory contains the generic templates and reviewed interaction code.
It contains no questions, stories, introduction, source notes, or other learner
content. Public assets do not read a bundled content JSON file or upload data.

Embed `index.html` in a same-origin iframe. On receipt of
`{ type: "interview-studio:ready" }` from that iframe, its parent can send
`{ type: "interview-studio:load", data: { behavior, foundations } }` to the
iframe using the exact same origin. The parent must validate the complete data
schema first. The runtime additionally checks the source window, exact origin,
and minimum mounting shape. It accepts one payload per iframe lifetime; remount
the iframe to replace or clear content. After mounting, it acknowledges with
`{ type: "interview-studio:loaded" }` to the exact same-origin parent.

Before clearing progress storage or removing the iframe, the trusted same-origin
parent can synchronously call `iframe.contentWindow.disposeStudio?.()`. This
disables subsequent persistence and suspends the practice timer and both panels.
It prevents pending saves or pagehide handlers from recreating cleared records.

`behavior.factNotes`, if present, is an array of `[title, text]` string tuples.
Counts come from the supplied arrays. Content stays in memory; the original
three progress/navigation storage keys remain compatible. Progress contains
learner notes and drafts and is therefore private browser data. Explicit export
downloads JSON; source links are HTTPS links opened only by the learner with no
referrer. CSP blocks connection requests and external embedded resources.

Regenerate the runtime assets with:

```sh
python3 scripts/build-studio-runtime.py --source /absolute/path/to/studio/source
```

The script only reads the reviewed JavaScript, stylesheet, and the two trusted
HTML templates. It does not execute another build script or copy content JSON.
