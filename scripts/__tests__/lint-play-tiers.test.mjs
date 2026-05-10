import { describe, it, expect } from 'vitest';
import { lintComponent } from '../lint-play-tiers.mjs';

describe('lintComponent — unmapped component', () => {
  it('rejects a component not in mapping or exclusion list', () => {
    const result = lintComponent({
      component: 'Mystery',
      storySource: 'export const Default = {};',
      mapping: { tiers: { A: [], B: [], C: [] }, excluded: [] },
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/not in tier mapping or exclusion list/);
  });
});
