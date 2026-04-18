# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-04-18

Adds dark mode support across the whole component library. Non-breaking:
existing APIs and light-theme visuals are unchanged.

### Added

- Dark mode for every component. Activates from the OS preference
  (`prefers-color-scheme: dark`) by default and can be overridden by an
  explicit `.dark` or `.light` class on `<html>`. Only layer-2 semantic
  tokens rebind; primitives stay put and the shadcn contract flips
  automatically via `var()` indirection. Brand blue shifts from
  `--blue-500` to `--blue-400` on dark for legibility; warm surfaces
  collapse to neutral dark equivalents; feedback colours pair a darker
  background with a lighter foreground to keep the pair ≥4.5:1.
- `--color-bg-overlay` token for modal scrims (50% black in light, 70% in
  dark).
- `:where(body)` baseline — zero-specificity background and foreground so
  icons and controls using `currentColor` inherit the active theme.
- Storybook theme toolbar via `@storybook/addon-themes` with three options:
  System (no class, OS preference wins), Light, and Dark.
- Color Scales page now also lists the warm palette (`--pink`, `--beige`,
  `--beige-light`, `--white`) and the six feedback tokens alongside the blue
  and neutral scales.
- Coverage stories that exercise previously-uncovered branches:
  `Button.AsChild`, `Checkbox.Standalone`, `Dialog.Opened` (with a `play`
  function that clicks the trigger so `DialogContent`/`Overlay`/`Header`/
  `Footer`/`Title`/`Description` mount), `Icon.Labelled`,
  `Radio.StandaloneItems`. Two `SearchBar` unit tests for `fullWidth` and
  `className` pass-through.
- `scripts/a11y-runtime-scan.mjs` — CLI axe-core scan across every story
  via Playwright. Supports `--dark` to run under the dark colour scheme.

### Changed

- `Checkbox` and `Radio` — disabled styling: the opacity-50 fade now
  applies to the control only, so disabled label text stays readable
  (previously 3.22:1 on white).
- `Dialog` overlay — now `bg-[var(--color-bg-overlay)]` instead of a
  hardcoded `bg-black/50`, so it darkens correctly in dark mode.
- `Checkbox` — hardcoded `text-white` in the checked/indeterminate states
  replaced with the `--color-text-on-brand` token.
- Token showcase stories use semantic colour tokens for chrome (labels,
  section headings, swatch borders) so they render correctly in both
  themes.
- Storybook preview removes the `initialGlobals.backgrounds.value: 'white'`
  default so the body background flows from the active theme; alternate
  backgrounds (light beige, pink, brand blue, etc.) can still be selected
  from the toolbar.

### Fixed

- `ProgressBar` `Interactive` story: the range input driving the bar now
  has an `aria-label` (previously reported as a critical axe violation).
- Storybook a11y rule config: `region`, `landmark-one-main`, and
  `page-has-heading-one` disabled globally for isolated story iframes;
  `color-contrast` disabled per-story on the token and typography colour
  showcase stories. Result: **0 runtime axe violations across all 84
  stories in both light and dark modes.**

## [0.2.0] - 2026-04-18

Breaking release: every component is now built on [shadcn/ui](https://ui.shadcn.com)
(Tailwind CSS v4 + Radix UI primitives). See the README for the v0.1.x → v0.2.0
migration table.

### Changed

- **Breaking:** Rebuilt all 17 components on shadcn/ui + Tailwind v4. The CSS
  Modules layer has been removed.
- **Breaking:** Reshaped public APIs for `Modal` → `Dialog`, `Tooltip` (now
  composable with `TooltipProvider`/`TooltipTrigger`/`TooltipContent`),
  `ToastContainer` + `useToast` → `Toaster` + `toast()` (sonner), and `Radio`
  → `RadioGroup` + `RadioGroupItem`.
- **Breaking:** `Checkbox` now forwards `onCheckedChange(state)` (Radix idiom)
  instead of the native `onChange(event)`.
- **Breaking:** Consumers must import the stylesheet explicitly:
  `import '@jens-wedin/design-system/styles'`.

### Added

- shadcn/ui + Tailwind CSS v4 build foundation, including a three-layer token
  architecture (primitives → semantic → shadcn contract) wired through
  `@theme inline { … }` — no `tailwind.config.js` required.
- jsdom-based unit-test suite with 100% line coverage.

### Removed

- `node_modules/` and `storybook-static/` are no longer tracked in the
  repository.

## [0.1.2] and earlier

See `git log` for the history prior to this changelog.

[0.3.0]: https://github.com/jens-wedin/manfred-design_system/releases/tag/v0.3.0
[0.2.0]: https://github.com/jens-wedin/manfred-design_system/releases/tag/v0.2.0
