// scripts/lint-play-tiers.mjs
// Pure ESM, Node.js 22+, no dependencies.

/**
 * Lint a single component's stories source against the tier contract.
 * @param {{component: string, storySource: string, mapping: object}} input
 * @returns {{ok: boolean, tier?: 'A'|'B'|'C'|'excluded', reason?: string}}
 */
export function lintComponent({ component, storySource, mapping }) {
  if (mapping.excluded.includes(component)) {
    return { ok: true, tier: 'excluded' };
  }
  let tier;
  if (mapping.tiers.A.includes(component)) tier = 'A';
  else if (mapping.tiers.B.includes(component)) tier = 'B';
  else if (mapping.tiers.C.includes(component)) tier = 'C';
  if (!tier) {
    return {
      ok: false,
      reason: `Component "${component}" is not in tier mapping or exclusion list. Add it to scripts/play-tiers.json.`,
    };
  }
  return { ok: true, tier };
}
