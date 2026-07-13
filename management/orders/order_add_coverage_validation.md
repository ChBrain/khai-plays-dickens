---
khai: order
title: "Add Coverage Validation"
license: CC-BY-NC-SA-4.0
stamp:
  owner: KAI HACKS AI
  version: v0.0.1
  date: "2026-07-13"
---

# Order: Add Coverage Validation

## Direction

Implement a Plot-to-Component Coverage check in the Vitest suite to ensure that all play components are mentioned in their corresponding plots.

## Orders

- Staging of test `every play component is fully covered in plot staves` in `tests/house.test.mjs`.

## Implementation

Parse all play directories, extract declared personas, places, and pieces, and assert they are referenced in the Cue, Action, or Stage sections of the plot files.

## Targets

- `tests/house.test.mjs`
