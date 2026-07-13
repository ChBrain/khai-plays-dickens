---
khai: order
title: "Renumber the Shorter Fiction series by first publication"
license: CC-BY-NC-SA-4.0
stamp:
  owner: KAI HACKS AI
  version: v0.0.1
  date: "2026-07-13"
---

# Order: Renumber the Shorter Fiction series by first publication

## Direction

The `csf_` series was numbered by staging date, not by Dickens's publication
date, inverting the chronology the `cdn_` and `ccb_` series already keep
(American Notes, 1842, was filed after Pictures from Italy, 1846). Renumber
the series once, by first publication, before a register seals the numbers
permanently. This is the one corrective renumber; after it, numbers are
handles, never resorted.

Ordering and dating are anchored to a reference model: Paul Schlicke (ed.),
The Oxford Companion to Charles Dickens (Oxford University Press, 1999;
anniversary edition 2011), the standard scholarly reference for publication
history, and Dickens Journals Online (djo.org.uk, University of Buckingham)
for issue-exact dates of work serialised in Household Words and All the Year
Round, cross-checked against public bibliographies; nothing invented. Rules:
a work is dated by its first publication; collections assembled by Dickens
anchor at the first piece's publication; same-year works tiebreak by first
UK publication date.

## Orders

Renumber `csf_` to the corrected sequence:

| ID        | Title                          | First publication                            | Was       |
| --------- | ------------------------------ | -------------------------------------------- | --------- |
| `csf_001` | Sketches by Boz                | 1836                                         | `csf_001` |
| `csf_002` | The Mudfog Papers              | 1837 to 1838, Bentley's Miscellany           | `csf_007` |
| `csf_003` | Master Humphrey's Clock        | 1840 to 1841                                 | `csf_004` |
| `csf_004` | American Notes                 | 1842                                         | `csf_009` |
| `csf_005` | Pictures from Italy            | 1846                                         | `csf_008` |
| `csf_006` | Christmas Stories              | Dec 1850 on, first number of Household Words | `csf_003` |
| `csf_007` | A Child's History of England   | 25 Jan 1851, Household Words                 | `csf_010` |
| `csf_008` | The Uncommercial Traveller     | 28 Jan 1860, All the Year Round              | `csf_002` |
| `csf_009` | Holiday Romance                | 25 Jan 1868, All the Year Round              | `csf_005` |
| `csf_010` | George Silverman's Explanation | 1 Feb 1868, All the Year Round               | `csf_006` |

The Mudfog Papers are dated by Dickens's own serialisation in Bentley's
Miscellany (from "The Public Life of Mr. Tulrumble", January 1837), not the
posthumous 1880 collection. Holiday Romance and George Silverman's
Explanation both first appeared in US venues in January 1868; the UK
tiebreak orders them by All the Year Round issue date. A Child's History
of England, staged during this order as `csf_010`, is dated by its
Household Words serialisation (25 January 1851 to 10 December 1853) and
folds in after the Christmas Stories, whose first number preceded it in
December 1850. The `cdn_` and `ccb_` series already hold publication order
and are untouched.

## Implementation

Rename the eight moving play directories and their `play_csf_*.md` files;
rewrite the relative play links inside each directory; rebuild the registry.
Content is otherwise untouched. Prior staging orders remain as historical
record under their original IDs.

## Targets

- `plays/csf_*/`
- `registry.json`
