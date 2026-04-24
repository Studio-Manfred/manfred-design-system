# Accessibility Color Audit Report

**Date:** 2026-04-04
**Standard:** WCAG 2.2 Level AA
**Scope:** All design tokens in `src/tokens/tokens.css`

---

## Summary

| Category | Tested | Pass | Fail |
|----------|--------|------|------|
| Text on backgrounds | 19 pairings | 18 | 1 |
| Interactive components | 6 pairings | 6 | 0 |
| Non-text UI elements | 8 pairings | 6 | 2 |
| **Total** | **33** | **30** | **3** |

---

## Violations Found

### 1. `--color-text-disabled` on `--color-bg-default` (WCAG 1.4.3)

| Property | Value |
|----------|-------|
| Foreground | `--neutral-300` → `#ababaf` |
| Background | `--white` → `#ffffff` |
| Contrast ratio | **2.29:1** |
| Required | 4.5:1 (normal text) / 3.0:1 (large text) |
| Severity | Low |
| Impact | Disabled text is intentionally low-contrast |

**Assessment:** This is a **known WCAG exception**. WCAG 1.4.3 explicitly states: *"Text or images of text that are part of an inactive user interface component... have no contrast requirement."* No action needed, but consider keeping the ratio above 2.0:1 as a usability floor (currently met).

---

### 2. `--color-border-default` on `--color-bg-default` (WCAG 1.4.11)

| Property | Value |
|----------|-------|
| Border | `--neutral-200` → `#d1d1d4` |
| Background | `--white` → `#ffffff` |
| Contrast ratio | **1.52:1** |
| Required | 3.0:1 for non-text UI components |
| Severity | **Serious** |
| Affected components | `TextInput`, `Modal` (header/footer dividers) |

**Recommendation:** Darken `--neutral-200` from `#d1d1d4` to approximately `#949499` (3.0:1), or change `--color-border-default` to reference `--neutral-400` (`#7c7c82`, 4.15:1). However, note that WCAG 1.4.11 applies to UI components needed to *identify* the component. Decorative dividers (Modal separators) may not require 3:1. The `TextInput` border **does** require 3:1 because the border is the only visual indicator of the input boundary.

**Suggested fix for TextInput:** Use `--color-border-strong` (`--neutral-400`, 4.15:1) instead of `--color-border-default` for input borders, or create a dedicated `--color-border-input` token at 3:1+.

---

### 3. `--color-border-default` on `--color-bg-subtle` (WCAG 1.4.11)

| Property | Value |
|----------|-------|
| Border | `--neutral-200` → `#d1d1d4` |
| Background | `--neutral-50` → `#f5f5f6` |
| Contrast ratio | **1.40:1** |
| Required | 3.0:1 |
| Severity | **Serious** |
| Impact | Any component using default borders on subtle backgrounds |

**Recommendation:** Same fix as above — any functional border on `bg-subtle` should use `--color-border-strong` or a new token.

---

## Passing Results (Highlights)

### Text Colors — All Strong

| Pairing | Ratio | Level |
|---------|-------|-------|
| `text-primary` on `bg-default` | 16.58:1 | AAA |
| `text-secondary` on `bg-default` | 10.46:1 | AAA |
| `text-muted` on `bg-default` | 7.29:1 | AAA |
| `text-brand` on `bg-default` | 8.01:1 | AAA |
| `text-inverse` on `bg-inverse` | 16.58:1 | AAA |
| `text-on-brand` on `bg-brand` | 8.01:1 | AAA |
| `text-primary` on `bg-warm` | 15.02:1 | AAA |
| `text-primary` on `bg-accent` | 13.32:1 | AAA |

### Feedback Colors — All Strong

| Pairing | Ratio | Level |
|---------|-------|-------|
| Success fg/bg | 9.42:1 | AAA |
| Warning fg/bg | 7.01:1 | AAA |
| Error fg/bg | 7.76:1 | AAA |
| Info fg/bg | 7.37:1 | AAA |

### Interactive Components — All Pass

| Pairing | Ratio | Level |
|---------|-------|-------|
| Primary button | 16.58:1 | AAA |
| Brand button | 8.01:1 | AAA |
| Brand button hover | 10.43:1 | AAA |
| Inverse button | 8.01:1 | AAA |

### Non-Text UI — Focus Ring Strong

| Pairing | Ratio | Pass? |
|---------|-------|-------|
| Focus ring on `bg-default` | 5.40:1 | Yes |
| Focus ring on `bg-subtle` | 4.95:1 | Yes |
| Focus ring on `bg-muted` | 4.41:1 | Yes |
| `border-strong` on `bg-default` | 4.15:1 | Yes |
| `border-brand` on `bg-default` | 8.01:1 | Yes |

---

## Recommended Actions

### Must Fix (before release)

1. **TextInput border:** Change from `--color-border-default` to `--color-border-strong` in `src/components/TextInput/TextInput.module.css` to meet WCAG 1.4.11

### Should Fix (current sprint)

2. **Consider a `--color-border-input` semantic token** at `--neutral-400` or darker, so input borders are always 3:1+ regardless of background
3. **Audit any future components** that place `--color-border-default` on functional (non-decorative) boundaries

### No Action Needed

4. **Disabled text** (2.29:1) — exempt per WCAG 1.4.3 inactive component exception
5. **Modal dividers** — decorative separators, not functional UI boundaries

---

## Methodology

- Calculated relative luminance per WCAG 2.2 formula (sRGB linearization)
- Tested 33 foreground/background pairings across all semantic token combinations
- Thresholds: 4.5:1 normal text, 3:1 large text (18pt+/14pt bold), 3:1 non-text UI components
- Resolved all `var()` references to final hex values from primitive tokens
