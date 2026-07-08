---
---

Governance: adopt the aligned Version-Packages flow. Add the `changeset-check`
gate (with `countDrivenAdd`), bump `@chbrain/khai-guard` to `^0.1.16`, prefix the
`version` script's registry build with `npx`, and flip the CLAUDE.md doctrine so a
play add carries a `minor` changeset (steered through the Version Packages PR; the
reconcile keeps `minor = count` and the patch at 0). Ships no package content: an
empty changeset.
