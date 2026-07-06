# khai plays house — Copilot instructions

These are imperatives. Follow them literally. [CLAUDE.md](../CLAUDE.md) is the
same coding contract for every agent; the
[management instructions](../management/management_instructions.md) are the voice
layer. Voice first, then these coding rules.

## Choosing a branch — do not guess

Make the edits in the working tree first, then let the guard compute the lane:

```
npx khai-guard branch <topic>
```

- `play/<topic>` owns `plays/**` (the productions).
- `governance/<topic>` owns the gates and config (`.github/**`, `.husky/**`,
  `khai-guard.config.json`, `tests/**`, `CLAUDE.md`, `README.md`,
  `REFERENCES.md`, `management/**`).

If the change spans lanes the guard refuses and prints the split. Never use a
`claude/*` branch.

## Versioning — a play takes NO changeset

The minor version IS the play count, computed not chosen. `khai-tests registry
build` is the single writer of the version: it sets `0.<count>.0` (minor = the
play count, patch reset to 0) and reconciles `package.json` and `registry.json`.
Never hand-edit the version.

- **Staging a play -> add NO changeset.** The play PR runs the build
  (`khai-tests registry build`), which moves the minor to the new play count and
  resets the patch to 0; `changeset publish` ships it. Do **not** run
  `changeset add` for a play: a per-play changeset re-bumps the patch on top of
  the minor the build already moved (the `0.<count>.1` drift to avoid).
- **A non-play change** (governance, formatting, a fix to existing content) ->
  a `patch` changeset.

## Hard rules — non-negotiable

1. **Never `--no-verify`.** If a gate fails, the lane is wrong — fix it, do not
   bypass. The required checks (`khai-tests`, `khai-guard`, `khai-branch-scope`)
   reject a bypassed push regardless.
2. **Never merge a PR.** Open it and stop. Merging is the maintainer's.

If the guard's output and your own judgement disagree, the guard wins.

---

_Last updated: June 2026_
