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

  it("every play component (persona, place, piece) is fully covered in plot staves (Cue, Action, or Stage)", () => {
    const playsDir = join(root, "plays");
    const errors = [];

    // Helper to extract a section by H2 heading name
    function getH2Section(content, headingName) {
      const parts = content.split(/\n##\s+/);
      for (const part of parts) {
        const lines = part.split(/\r?\n/);
        const heading = lines[0].trim();
        if (heading === headingName) {
          return lines.slice(1).join("\n");
        }
      }
      return "";
    }

    // Helper to find all markdown links to persona, place, or piece files in a text block
    function findComponentLinks(text) {
      const links = new Set();
      const re = /\]\(((persona|place|piece)_[^()\s]+?\.md)(?:#[^()\s]*)?\)/g;
      let m;
      while ((m = re.exec(text))) {
        links.add(m[1]);
      }
      return links;
    }

    function checkPlayDir(playDirName) {
      const playDir = join(playsDir, playDirName);
      const files = readdirSync(playDir);

      const playFile = files.find((f) => f.startsWith("play_") && f.endsWith(".md"));
      if (!playFile) return;

      const playContent = readFileSync(join(playDir, playFile), "utf8");
      const companySection = getH2Section(playContent, "Company");
      if (!companySection) {
        errors.push(`${playFile}: "Company" section not found`);
        return;
      }

      // 1. Extract all declared personas, places, pieces from the Company section
      const declaredComponents = findComponentLinks(companySection);

      // 2. Scan all plot files in this play directory
      const plotFiles = files.filter((f) => f.startsWith("plot_") && f.endsWith(".md"));
      const plotReferencedComponents = new Set();

      for (const plotFile of plotFiles) {
        const plotContent = readFileSync(join(playDir, plotFile), "utf8");

        // Extract Cue, Action, and Stage sections from the plot file
        const cueSec = getH2Section(plotContent, "Cue");
        const actionSec = getH2Section(plotContent, "Action");
        const stageSec = getH2Section(plotContent, "Stage");

        const combinedText = [cueSec, actionSec, stageSec].join("\n");
        const referencedInPlot = findComponentLinks(combinedText);

        for (const link of referencedInPlot) {
          plotReferencedComponents.add(link);

          // Verify that this component is declared in the play's Company
          if (!declaredComponents.has(link)) {
            errors.push(
              `${plotFile}: references "${link}" in Cue/Action/Stage, but it is not declared in ${playFile} Company`,
            );
          }
        }
      }

      // 3. Verify that every declared component is referenced at least once in the plots
      for (const comp of declaredComponents) {
        if (!plotReferencedComponents.has(comp)) {
          errors.push(
            `${playFile}: declared component "${comp}" is not referenced in any plot's Cue, Action, or Stage section`,
          );
        }
      }
    }

    for (const entry of readdirSync(playsDir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
        checkPlayDir(entry.name);
      }
    }

    expect(errors).toEqual([]);
  });
});
