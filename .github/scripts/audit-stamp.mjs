#!/usr/bin/env node
// Stamp an audit's meta.json with the content it was reviewed against, so the
// freshness gate can prove the audit actually ran on the CURRENT content (and
// catch a stale or never-run audit). Run by the review job after the review.
//
//   node .github/scripts/audit-stamp.mjs <audit/<id>/audit.json>
//
// Records, per target, the git tree sha at HEAD (the content the review just
// read). The freshness gate recomputes these at check time and compares.

import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";

const [manifestPath] = process.argv.slice(2);
if (!manifestPath) {
  console.error("usage: audit-stamp.mjs <audit/<id>/audit.json>");
  process.exit(2);
}

const cfg = JSON.parse(readFileSync(manifestPath, "utf8"));
const headSha = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const treeSha = (path) => {
  try {
    return execFileSync("git", ["rev-parse", `HEAD:${path}`], { encoding: "utf8" }).trim();
  } catch {
    return null; // a target that does not resolve to a tree (missing) stamps null
  }
};

const targets = {};
for (const t of cfg.review?.targets ?? []) targets[t] = treeSha(t);

const meta = {
  auditId: cfg.id,
  reviewedSha: headSha,
  reviewedAt: new Date().toISOString(),
  targets,
};
writeFileSync(join(dirname(manifestPath), "meta.json"), JSON.stringify(meta, null, 2) + "\n");
console.log(`stamped ${cfg.id} at ${headSha}`);
