#!/usr/bin/env node
// The consistency gate as a verdict (not an exit code), so a job can post it as
// a commit status. It combines freshness (each audit ran against the current
// content) and reconcile (the table agrees with the comment treatments) for the
// audits passed, and prints {ok, summary} JSON. Exit 0 always; the verdict is in
// the output, and the workflow turns it into the `consistency` commit status.
//
//   node .github/scripts/audit-gate.mjs <threads.json> <audit/<id>/audit.json> [more...]

import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { decisionsFromThreads, reconcile } from "@chbrain/khai-review";

const [threadsPath, ...manifests] = process.argv.slice(2);
const treeSha = (p) => {
  try {
    return execFileSync("git", ["rev-parse", `HEAD:${p}`], { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
};
const decisions = decisionsFromThreads(
  threadsPath && existsSync(threadsPath) ? JSON.parse(readFileSync(threadsPath, "utf8")) : [],
);

const reasons = [];
for (const m of manifests) {
  const cfg = JSON.parse(readFileSync(m, "utf8"));
  const dir = dirname(m);
  // freshness: the audit must have run against the current content
  const metaPath = join(dir, "meta.json");
  if (!existsSync(metaPath)) {
    reasons.push(`${cfg.id}: not run, comment /audit ${cfg.id}`);
    continue;
  }
  const meta = JSON.parse(readFileSync(metaPath, "utf8"));
  for (const t of cfg.review?.targets ?? [])
    if (treeSha(t) !== (meta.targets?.[t] ?? null))
      reasons.push(`${cfg.id}: ${t} changed since the audit, comment /audit ${cfg.id}`);
  // reconcile: the table must agree with the comment treatments
  const ledgerPath = join(dir, "ledger.json");
  const ledger = existsSync(ledgerPath) ? JSON.parse(readFileSync(ledgerPath, "utf8")) : [];
  for (const b of reconcile(ledger, decisions).blocks)
    reasons.push(`${cfg.id}/${b.id}: ${b.reason}`);
}

const ok = reasons.length === 0;
const summary = ok
  ? `consistent across ${manifests.length} audit(s)`
  : reasons.slice(0, 2).join("; ") + (reasons.length > 2 ? ` (+${reasons.length - 2})` : "");
process.stdout.write(JSON.stringify({ ok, summary }) + "\n");
