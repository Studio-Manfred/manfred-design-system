# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[0.2.0]: https://github.com/jens-wedin/manfred-design_system/releases/tag/v0.2.0
