// scripts/lint-play-tiers.mjs
// Pure ESM, Node.js 22+, no dependencies.

const ARIA_ATTR_RE = /\baria-[a-z]+\b/;
const PLAY_BLOCK_RE = /play\s*:\s*async\s*\(\s*\{[^}]*\}\s*\)\s*=>\s*\{/;
const ROLE_QUERY_RE = /(?:get|find|query)ByRole\s*\(/;
const USER_EVENT_INTERACTION_RE = /userEvent\.(click|type|selectOptions|hover|paste|clear)\b/;
const USER_EVENT_KEYBOARD_RE = /userEvent\.(keyboard|tab)\b/;
const EXPECT_RE = /\bexpect\s*\(/;

/**
 * Lint a single component's stories source against the tier contract.
 * @param {{component: string, storySource: string, mapping: {tiers: {A: string[], B: string[], C: string[]}, excluded: string[]}}} input
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

  if (!PLAY_BLOCK_RE.test(storySource)) {
    return {
      ok: false,
      tier,
      reason: `Component "${component}" (tier ${tier}) has no play function in its stories file.`,
    };
  }

  // Tier A: must have a role query + expect.
  if (!(ROLE_QUERY_RE.test(storySource) && EXPECT_RE.test(storySource))) {
    return {
      ok: false,
      tier,
      reason: `Component "${component}" (tier ${tier}) play function missing role query + expect.`,
    };
  }

  if (tier === 'A') {
    return { ok: true, tier };
  }

  // Tier B: A + userEvent interaction.
  if (!USER_EVENT_INTERACTION_RE.test(storySource)) {
    return {
      ok: false,
      tier,
      reason: `Component "${component}" (tier ${tier}) play function missing userEvent interaction (click/type/selectOptions).`,
    };
  }

  if (tier === 'B') {
    return { ok: true, tier };
  }

  // Tier C: B + keyboard + ARIA assertion.
  if (!USER_EVENT_KEYBOARD_RE.test(storySource)) {
    return {
      ok: false,
      tier,
      reason: `Component "${component}" (tier ${tier}) play function missing keyboard regression (userEvent.keyboard or userEvent.tab).`,
    };
  }
  if (!ARIA_ATTR_RE.test(storySource)) {
    return {
      ok: false,
      tier,
      reason: `Component "${component}" (tier ${tier}) play function missing ARIA assertion (e.g. aria-expanded, aria-checked).`,
    };
  }

  return { ok: true, tier };
}
