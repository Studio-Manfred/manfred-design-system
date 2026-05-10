// scripts/lint-play-tiers.mjs
// Pure ESM, Node.js 22+, no dependencies.

// NOTE: Matches any aria-* token in the source — including static aria attributes
// in the render body (e.g., <div aria-hidden>). The intent is "play function asserts
// on an ARIA attribute," but we can't distinguish that from a rendered attribute.
// Accepted approximation; documented in docs/PLAY-FUNCTIONS.md.
const ARIA_ATTR_RE = /\baria-[a-z]+\b/;
const PLAY_BLOCK_RE = /play\s*:\s*async\s*\([^)]*\)\s*=>\s*\{/;
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
  // 1. Malformed-mapping guard
  if (
    !mapping ||
    !Array.isArray(mapping.excluded) ||
    !mapping.tiers ||
    !Array.isArray(mapping.tiers.A) ||
    !Array.isArray(mapping.tiers.B) ||
    !Array.isArray(mapping.tiers.C)
  ) {
    return {
      ok: false,
      reason: 'Malformed mapping — expected { tiers: { A, B, C }, excluded } with arrays. Check scripts/play-tiers.json.',
    };
  }

  // 2. Non-string storySource guard
  if (typeof storySource !== 'string') {
    return {
      ok: false,
      reason: `Component "${component}" — storySource must be a string, got ${typeof storySource}.`,
    };
  }

  // 3. Excluded component → return ok
  if (mapping.excluded.includes(component)) {
    return { ok: true, tier: 'excluded' };
  }

  // 4. Tier lookup with duplicate detection
  const matchingTiers = (['A', 'B', 'C']).filter(t => mapping.tiers[t].includes(component));
  if (matchingTiers.length > 1) {
    return {
      ok: false,
      reason: `Component "${component}" appears in multiple tier arrays (${matchingTiers.join(', ')}). Each component must be in exactly one tier or the exclusion list. Fix scripts/play-tiers.json.`,
    };
  }
  const tier = matchingTiers[0];

  if (!tier) {
    return {
      ok: false,
      reason: `Component "${component}" is not in tier mapping or exclusion list. Add it to scripts/play-tiers.json.`,
    };
  }

  // 5. Strip comments from storySource before applying regexes
  const stripped = storySource.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

  // 6. Apply assertion regexes against stripped source

  if (!PLAY_BLOCK_RE.test(stripped)) {
    return {
      ok: false,
      tier,
      reason: `Component "${component}" (tier ${tier}) has no play function in its stories file.`,
    };
  }

  // Tier A: must have a role query + expect.
  if (!(ROLE_QUERY_RE.test(stripped) && EXPECT_RE.test(stripped))) {
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
  if (!USER_EVENT_INTERACTION_RE.test(stripped)) {
    return {
      ok: false,
      tier,
      reason: `Component "${component}" (tier ${tier}) play function missing userEvent interaction (click/type/selectOptions/hover/paste/clear).`,
    };
  }

  if (tier === 'B') {
    return { ok: true, tier };
  }

  // Tier C: B + keyboard + ARIA assertion.
  if (!USER_EVENT_KEYBOARD_RE.test(stripped)) {
    return {
      ok: false,
      tier,
      reason: `Component "${component}" (tier ${tier}) play function missing keyboard regression (userEvent.keyboard or userEvent.tab).`,
    };
  }
  if (!ARIA_ATTR_RE.test(stripped)) {
    return {
      ok: false,
      tier,
      reason: `Component "${component}" (tier ${tier}) play function missing ARIA assertion (e.g. aria-expanded, aria-checked).`,
    };
  }

  return { ok: true, tier };
}
