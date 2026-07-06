import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { validateProject } from "@chbrain/khai-tests";
import { referenceCard } from "@chbrain/khai-arch";
import { validateProjectLanguages } from "@chbrain/khai-language";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Every play in the Dickens house conforms to the canon. Green on an
// empty house (no plays yet); as plays land, each is validated against its type
// and the wiring the installed engines declare. The house holds; the plays are
// written in khai-playwright mode.
describe("Dickens house: plays conform to the canon", () => {
  it("every play validates against the canon (zero findings)", () => {
    const results = validateProject({ root, contentDir: join(root, "plays") });
    const errors = results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));
    // Advisory findings (e.g. a Company element no plot casts) do not fail the
    // build, but they are surfaced in the CI log so the drift is visible here
    // rather than only to a human reading the rendered play.
    const warnings = results.flatMap((r) => (r.warnings ?? []).map((w) => `${r.file}: ${w}`));
    if (warnings.length) console.warn(`house warnings (advisory):\n${warnings.join("\n")}`);
    expect(errors).toEqual([]);
  });

  it("the management cast conforms; every position has a persona", () => {
    const results = validateProject({ root, contentDir: join(root, "management") });
    const errors = results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));
    expect(errors).toEqual([]);
  });

  it("every play satisfies the language policy", () => {
    const results = validateProjectLanguages(root);
    const errors = results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));
    expect(errors).toEqual([]);
  });

  it("house reference warrant conforms to LORE", () => {
    const refPath = existsSync(join(root, "REFERENCES.md"))
      ? join(root, "REFERENCES.md")
      : join(root, "REFERENCE.md");
    expect(existsSync(refPath)).toBe(true);
    const refText = readFileSync(refPath, "utf8");
    expect(() => referenceCard(refText)).not.toThrow();
  });

  it("every play is isolated (no relative links pointing outside the play's directory)", () => {
    const playsDir = join(root, "plays");
    const errors = [];

    function walk(dir) {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
          walk(fullPath);
        } else if (entry.name.endsWith(".md")) {
          // Only check files inside a play subdirectory (a child directory of plays/)
          const relativeDir = dirname(fullPath)
            .slice(playsDir.length)
            .replace(/^[/\\]+/, "");
          if (!relativeDir) continue;

          const content = readFileSync(fullPath, "utf8");
          const re = /\]\(([^()\s]+)\)/g;
          let m;
          while ((m = re.exec(content))) {
            const target = m[1].split("#")[0];
            if (!target || /^[a-z]+:\/\//i.test(target)) continue;

            // Relative link must be strictly local (no traversal or folder nesting)
            if (target.includes("..") || target.includes("/") || target.includes("\\")) {
              errors.push(`${fullPath}: relative link "${m[1]}" escapes local play directory`);
            }
          }
        }
      }
    }

    walk(playsDir);
    expect(errors).toEqual([]);
  });
});
