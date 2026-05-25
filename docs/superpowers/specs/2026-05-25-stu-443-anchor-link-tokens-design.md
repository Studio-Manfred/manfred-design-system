# STU-443 — Anchor link tokens + `.manfred-prose` class

**Date:** 2026-05-25
**Linear:** [STU-443](https://linear.app/studio-manfred/issue/STU-443)
**Branch:** `jens-wedin/stu-443-anchor-styling-ship-link-tokens-prose-css-so-consumers-stop`

## Problem

Tailwind v4 Preflight (bundled by the DS) resets `<a>` so anchors lose both their default underline and any distinguishing colour — they just inherit text colour. Every downstream consumer has been re-deriving the same Manfred link treatment (peach `#efd6d3` + underline + 4px offset on brand-blue; brand-blue + underline on white). The website hit the same hole three times in two months: Mission greeting links, the "Get in touch" inline link, and `.article-body a` inside imported WordPress HTML.

WCAG 1.4.1 makes this not a vanity issue: links inside a text block must be distinguishable by more than colour alone. Worse, content injected as raw HTML from a CMS cannot be patched with a React `<Link>` primitive — only CSS can reach it.

## Goals

* Ship the brand link decision *in the design system* so consumers can stop owning it.
* Cover the hardest case: raw `<a>` inside CMS-injected HTML.
* Stay additive — no breaking changes, no consumer migration required to keep current behaviour.

## Non-goals

* `<Link>` JSX primitive — separate ticket if needed.
* Full Tailwind-Typography-style prose styling (headings, lists, etc.). Anchor-only for v1; expand later if/when needed.
* Reverting the website's interim CSS rule. That stays in place; this ticket removes the foot-gun for future surfaces.

## Design

### 1. Link tokens (Layer 2 semantic)

Add to `src/tokens/tokens.css`, in the Layer 2 block immediately after `--color-text-on-brand`:

```css
/* Links — on white/cream surfaces */
--color-text-link:       var(--color-business-blue);
--color-text-link-hover: var(--blue-600);

/* Links — on brand-blue surfaces */
--color-text-link-on-brand:       var(--pink);
--color-text-link-on-brand-hover: var(--white);
```

**Dark mode rebinds** (both the `@media (prefers-color-scheme: dark)` block and the `:root.dark` block — the file already duplicates):

```css
--color-text-link:       var(--blue-300);
--color-text-link-hover: var(--blue-200);
/* on-brand tokens stay the same — the brand surface is identity-fixed,
   so the peach-on-blue contrast doesn't change between themes. */
```

Rationale:
* `var(--color-business-blue)` for default link reuses the existing brand-blue alias — keeps a single source of truth.
* `--blue-600` for hover matches `--color-interactive-brand-bg-hover` precedent.
* On-brand peach/white pair already exists in the wild (the website's WhatElse and Mission links); the DS is just formalising what's been re-derived.
* Dark-mode default link aligns with `--color-text-brand` (`--blue-300`) for visual consistency with other brand-tinted text.

### 2. `.manfred-prose` class

Add to the end of `src/tokens/tokens.css`, after the `@theme inline` block (plain CSS, not utilities — survives the Tailwind compile pass and lands in `dist/style.css`):

```css
/* ==========================================
   PROSE WRAPPER
   Restores brand link styling inside content
   the DS can't reach as JSX — typically CMS
   HTML injected via the React raw-HTML escape
   hatch. Scoped to <a> for v1 (YAGNI on
   headings/lists). Apply `manfred-prose--on-brand`
   to switch the palette on brand-blue surfaces.
   ========================================== */
.manfred-prose a {
  color: var(--color-text-link);
  text-decoration: underline;
  text-underline-offset: 4px;
}
.manfred-prose a:hover {
  color: var(--color-text-link-hover);
}

.manfred-prose--on-brand a {
  color: var(--color-text-link-on-brand);
}
.manfred-prose--on-brand a:hover {
  color: var(--color-text-link-on-brand-hover);
}
```

Modifier-class pattern (`.manfred-prose--on-brand` rather than auto-detection from inherited context) is explicit, easy to reason about, and matches BEM conventions consumers will already recognise.

### 3. Storybook surface

Add a story file `src/tokens/Links.stories.tsx` (or a new section inside the existing token story page) that shows:

* On-white surface — paragraph with inline link, default + hover state captured.
* On-brand surface (`bg-[var(--color-business-blue)]`) with `manfred-prose manfred-prose--on-brand` — paragraph + link, default + hover.
* A raw-HTML demo (React's escape-hatch prop with hard-coded safe content) to prove the prose class reaches CMS-shaped content.

This gives Chromatic a baseline target and the runtime a11y scanner a story to hit. Add a `play` function (tier C — visual smoke) asserting computed `text-decoration-line` includes `underline` and `color` matches the expected token, to lock the contract in CI.

### 4. Documentation

* `src/tokens/Tokens.mdx`: new "Links" subsection listing the four tokens with swatches and a one-line usage hint pointing at the `manfred-prose` story.
* `CHANGELOG.md`: minor entry under "Added" — `--color-text-link*` tokens, `.manfred-prose` wrapper.

### 5. Acceptance criteria (from the Linear ticket)

* [x] DS exposes link tokens (default + hover, on-white + on-brand).
* [x] DS exposes `.manfred-prose` that, applied to a wrapper, gives every nested `<a>` the brand look without consumer-side CSS.
* [ ] *(Verified by consumer after release)* Website can drop `#efd6d3` literals and the `.article-body a` rule, replacing them with `manfred-prose` + token refs. Existing `e2e/article-link-style.spec.ts` keeps passing.

## Implementation order

1. Tokens — add to `tokens.css` (light + both dark blocks).
2. Prose CSS — append to `tokens.css` after `@theme inline`.
3. Story — `src/tokens/Links.stories.tsx` with the three demos + tier-C play function.
4. Tokens.mdx — new Links subsection.
5. CHANGELOG — Added entry.
6. Version bump — minor (additive). Commit per memory's "split by concern" convention.
7. Local verification — `npm run test`, `npm run test:storybook`, `npm run lint:play-tiers`, runtime a11y scan light + dark, `npm run build`.
8. Stop before push/tag/release per memory — leave clean commits, surface readiness.

## Risks / open questions

* **Tailwind v4 Preflight specificity:** Preflight's `a { color: inherit; text-decoration: inherit; }` is zero-specificity. `.manfred-prose a { color: var(--color-text-link); }` (specificity 0,1,1) wins. Verified.
* **Consumer using Tailwind Typography plugin:** If a consumer also uses `@tailwindcss/typography`'s `.prose`, the two classes coexist fine — different class names. Naming `.manfred-prose` (not `.prose`) is deliberate.
* **Future expansion:** If the prose class grows (headings, lists, code blocks), the v1 anchor-only ruleset stays compatible — additive.

## Out of band

* Website consumption is a separate change after this releases. Don't touch the website repo in this work.
