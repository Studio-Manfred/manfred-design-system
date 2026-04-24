# Accessibility Audit Report

**Project:** Manfred Design System (`@jens-wedin/design-system` v0.1.2)
**Date:** 2026-04-04
**Standard:** WCAG 2.2 Level AA
**Scan modes:** Static (eslint-plugin-jsx-a11y) + Runtime (axe-core 4.10.2) + Manual code review

---

## Executive Summary

The design system has a **strong accessibility foundation** — semantic HTML, ARIA attributes, screen-reader text, focus traps, and live regions are used correctly across most components. However, there are **8 actionable issues** that should be resolved before production use.

| Severity | Count | Description |
|----------|-------|-------------|
| Critical (P0) | 2 | Missing focus styles, continuous animation without reduced-motion |
| Serious (P1) | 3 | Missing reduced-motion for entrance/exit animations, undersized touch targets |
| Moderate (P2) | 2 | Small visual control sizes, missing min-height |
| Minor (P3) | 1 | Borderline close button target size |

---

## Scan Results

### Static Analysis (eslint-plugin-jsx-a11y strict mode)

**Result: 0 violations** across all 17 components and stories.

### Runtime Analysis (axe-core 4.10.2, 97 stories)

**Result: 0 component-level violations.**

4 rules flagged (`document-title`, `html-has-lang`, `landmark-one-main`, `page-has-heading-one`) are Storybook iframe environment issues — not component bugs. These occur because Storybook's iframe renderer doesn't set `<html lang>`, `<title>`, `<main>`, or `<h1>` elements. This is expected and not actionable at the component level.

### Manual Code + CSS Review

This is where the real findings are:

---

## Findings

### P0-1: Button — Missing `:focus-visible` styles

| Field | Value |
|-------|-------|
| **Component** | `Button` |
| **File** | `src/components/Button/Button.module.css` |
| **Impact** | Critical |
| **WCAG** | 2.4.7 Focus Visible (Level AA) |

**Issue:** The Button component has **no `:focus-visible` or `:focus` CSS rule**. Keyboard users receive no visible focus indicator when tabbing to buttons. This is the most-used interactive component in any design system.

**Fix:** Add a `:focus-visible` rule:
```css
.root:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}
```

---

### P0-2: Spinner — Missing `prefers-reduced-motion`

| Field | Value |
|-------|-------|
| **Component** | `Spinner` |
| **File** | `src/components/Spinner/Spinner.module.css` |
| **Impact** | Critical |
| **WCAG** | 2.3.3 Animation from Interactions (Level AAA), 2.3.1 Three Flashes (Level A) |

**Issue:** The `.spin` animation runs infinitely (`animation: spin 700ms linear infinite`) with **no `prefers-reduced-motion` override**. Users who have requested reduced motion will still see continuous spinning, which can cause vestibular discomfort.

**Fix:**
```css
@media (prefers-reduced-motion: reduce) {
  .spin {
    animation: none;
  }
}
```

---

### P1-1: Modal — Missing `prefers-reduced-motion`

| Field | Value |
|-------|-------|
| **Component** | `Modal` |
| **File** | `src/components/Modal/Modal.module.css` |
| **Impact** | Serious |
| **WCAG** | 2.3.3 Animation from Interactions |

**Issue:** `fadeIn` and `scaleIn` animations (250ms) have no `prefers-reduced-motion` override. The scale animation is particularly problematic for vestibular-sensitive users.

**Fix:**
```css
@media (prefers-reduced-motion: reduce) {
  .backdrop {
    animation: none;
  }
  .panel {
    animation: none;
  }
}
```

---

### P1-2: Toast — Missing `prefers-reduced-motion`

| Field | Value |
|-------|-------|
| **Component** | `Toast` |
| **File** | `src/components/Toast/Toast.module.css` |
| **Impact** | Serious |
| **WCAG** | 2.3.3 Animation from Interactions |

**Issue:** `slideIn` and `slideOut` animations involve transform and opacity transitions with no reduced-motion override.

**Fix:**
```css
@media (prefers-reduced-motion: reduce) {
  .toastItem {
    animation: none;
  }
  .exiting {
    animation: none;
    opacity: 0;
  }
}
```

---

### P1-3: SearchBar & Alert — Touch targets below 24×24px minimum

| Field | Value |
|-------|-------|
| **Components** | `SearchBar` (clear button), `Alert` (close button) |
| **Files** | `src/components/SearchBar/SearchBar.module.css`, `src/components/Alert/Alert.module.css` |
| **Impact** | Serious |
| **WCAG** | 2.5.8 Target Size (Minimum) (Level AA) — 24×24px |

**Issue:** Both buttons have `padding: 0` and no explicit width/height. The clickable area is only the icon size (~16–20px), which fails the 24×24px WCAG 2.2 minimum.

**Fix:** Add minimum dimensions:
```css
.clearBtn, .closeBtn {
  min-width: 24px;
  min-height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

---

### P2-1: Checkbox & Radio — Visual control only 18×18px

| Field | Value |
|-------|-------|
| **Components** | `Checkbox`, `Radio` |
| **Files** | `src/components/Checkbox/Checkbox.module.css`, `src/components/Radio/Radio.module.css` |
| **Impact** | Moderate |
| **WCAG** | 2.5.8 Target Size (Minimum) |

**Issue:** The visual `.control` element is only 18×18px. The actual click target is the full `<label>` (which includes the label text), so this is mitigated when a label is present. However, if used without a label, the target is too small.

**Recommendation:** Increase `.control` to 20×20px minimum and ensure the label row always provides at least 24px effective target height via padding on `.root`.

---

### P2-2: Button `sm` — No guaranteed minimum height

| Field | Value |
|-------|-------|
| **Component** | `Button` (size="sm") |
| **File** | `src/components/Button/Button.module.css` |
| **Impact** | Moderate |
| **WCAG** | 2.5.8 Target Size (Minimum) |

**Issue:** The `sm` size uses padding alone (`8px 16px` + 14px font), producing a height of approximately 30px. While this meets the 24px minimum, consider adding `min-height: var(--size-control-sm)` (32px) for consistency.

---

### P3-1: Modal close button — Borderline target size

| Field | Value |
|-------|-------|
| **Component** | `Modal` |
| **File** | `src/components/Modal/Modal.module.css` |
| **Impact** | Minor |
| **WCAG** | 2.5.8 Target Size (Minimum) |

**Issue:** Close button has 4px padding + ~20px icon = ~28px total. Meets the 24px minimum but falls short of the 44px AAA recommendation.

**Recommendation:** Increase to `min-width: 32px; min-height: 32px` for better usability.

---

## What's Working Well

The following accessibility patterns are correctly implemented:

| Pattern | Components |
|---------|------------|
| `role="alert"` for notifications | Alert |
| `aria-label` on icon-only buttons | Alert close, Modal close, SearchBar clear |
| `aria-hidden="true"` on decorative icons | Icon, Alert icon, Checkbox control, Radio control, Breadcrumb separator |
| `role="progressbar"` with aria-value* | ProgressBar |
| `role="dialog"` + `aria-modal` + `aria-labelledby` | Modal |
| Focus trap with Tab/Shift+Tab cycling | Modal |
| Escape key to close | Modal, Tooltip |
| Focus restoration on close | Modal |
| `role="tooltip"` + `aria-describedby` | Tooltip |
| `role="status"` for loading indicator | Spinner |
| `aria-current="page"` on current breadcrumb | Breadcrumb |
| `aria-label="Breadcrumb"` on `<nav>` | Breadcrumb |
| `aria-invalid` for error states | Checkbox, TextInput |
| `aria-live="polite"` for form messages | FormField |
| Screen-reader-only text for status badges | Badge |
| Proper `<label>` wrapping for form controls | Checkbox, Radio |
| Indeterminate state via ref | Checkbox |
| Keyboard-triggered search on Enter | SearchBar |
| Semantic heading hierarchy defaults | Typography |
| Accessible Logo with `role="img"` + `aria-label` | Logo |

---

## Recommended Priority Order

1. **Button focus-visible** — Fix immediately. Most-used interactive component, zero keyboard indication.
2. **Spinner reduced-motion** — Fix immediately. Continuous infinite animation.
3. **Modal reduced-motion** — Fix in current sprint.
4. **Toast reduced-motion** — Fix in current sprint.
5. **SearchBar/Alert touch targets** — Fix in current sprint.
6. **Checkbox/Radio control size** — Fix when convenient.
7. **Button sm min-height** — Fix when convenient.
8. **Modal close button size** — Fix when convenient.

---

## Storybook Environment Notes

Consider adding `lang="en"` to the Storybook preview HTML template (`.storybook/preview-head.html` or `manager-head.html`) to eliminate the 97× `html-has-lang` axe warnings in CI. This doesn't affect the components themselves but improves the Storybook a11y addon panel experience.

---

## Methodology

| Tool | Version | Scope |
|------|---------|-------|
| eslint-plugin-jsx-a11y | 6.10.2 | Strict mode, all `.tsx` files |
| axe-core | 4.10.2 | `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice` |
| Playwright | 1.58.2 | Headless Chromium, 97 stories |
| Manual review | — | All 17 component source files + CSS modules |
