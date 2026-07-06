#!/usr/bin/env node
// Turn a PR's review threads into the treatment decisions the review run applies
// to the ledger (the comment -> table sync). The workflow's github-script step
// fetches the threads as JSON; this extracts one decision per finding thread.
//
//   node .github/scripts/audit-decisions.mjs <threads.json> > decisions.json

import { readFileSync } from "node:fs";
import { decisionsFromThreads } from "@chbrain/khai-review";

const [threadsPath] = process.argv.slice(2);
const threads = threadsPath ? JSON.parse(readFileSync(threadsPath, "utf8")) : [];
process.stdout.write(JSON.stringify(decisionsFromThreads(threads), null, 2) + "\n");
