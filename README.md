# Manfred Design System

React component library for the Manfred product — brand tokens,
typography, and 30+ accessible components built on
[shadcn/ui](https://ui.shadcn.com), Tailwind CSS v4, and Radix UI
primitives.

Published as `@studio-manfred/manfred-design-system` on GitHub Packages.

**🔗 Live Storybook:** https://studio-manfred.github.io/manfred-design-system/ — every component, every state, no install needed.

**🤖 AI agents:** see [AGENTS.md](AGENTS.md) (generic) or
[CLAUDE.md](CLAUDE.md) (Claude Code). The repo ships a Storybook MCP
server at `http://localhost:6006/mcp` for live component-API access.

## Install

> **⚠️ Authentication required.** This package lives on **GitHub Packages**,
> not public npm. You must configure `.npmrc` *and* a `read:packages`
> Personal Access Token before `npm install` will work. Full 5-step
> onboarding (PAT scope, shell setup, CI examples, troubleshooting) in
> [docs/CONSUMING.md](docs/CONSUMING.md).

Minimum setup, in the consuming project's root:

```
# .npmrc
@studio-manfred:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Then:

```bash
npm install @studio-manfred/manfred-design-system
```

Peer deps: `react >= 18`, `react-dom >= 18`.

## Use

Import the stylesheet once at your app root, then use components
anywhere:

```tsx
import '@studio-manfred/manfred-design-system/styles';
import { Button, Dialog, DialogTrigger, DialogContent } from '@studio-manfred/manfred-design-system';

export function Example() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="brand">Open</Button>
      </DialogTrigger>
      <DialogContent>…</DialogContent>
    </Dialog>
  );
}
```

The stylesheet bundles the compiled component CSS, design tokens, and
the themed baseline — nothing else to wire up to render DS components.
Browse every component with live examples at the
[public Storybook](https://studio-manfred.github.io/manfred-design-system/),
or run it locally with `npm run storybook` (see below).

### Tailwind v4 utilities in your own code

If your app uses Tailwind v4 and you want to write
`bg-muted`, `text-muted-foreground`, `bg-accent`, `bg-card`,
`bg-popover`, `bg-destructive`, `border-border`, `ring-ring`, etc.
in your own components, add a second import to your Tailwind input CSS:

```css
/* app/globals.css (or wherever you @import "tailwindcss") */
@import "tailwindcss";
@import "@studio-manfred/manfred-design-system/tokens.css";
```

This exposes the shadcn-shape token contract to your Tailwind utility
generator. Without it, those utilities compile to nothing in your build
(the `@theme` block lives in the DS source CSS but is consumed at our
build time, so it doesn't reach your Tailwind from the bundled stylesheet).
Keep `import '@studio-manfred/manfred-design-system/styles';` at the app
entry too — `tokens.css` is the Tailwind-input side; `styles` is the
runtime component CSS.

### Components

Accordion · Alert · Avatar · Badge · Breadcrumb · Button · Card ·
Chart (Donut / Bar / Line / Legend / Tooltip) · Checkbox · DatePicker ·
Dialog · FormField · Icon · Kbd · Label · Logo · NavBar · NavigationMenu ·
ProgressBar · RadioGroup · SearchBar · Select · Separator · Sheet ·
Spinner · Switch · Tabs · TextInput · Textarea · Toaster · Tooltip ·
Typography.

Plus layout primitives: Container · Grid · PageBackground · PageShell ·
Stack (HStack / VStack).

`DatePicker` supports single-date (`mode="single"`, default) and
date-range (`mode="range"`) selection. TextInput-styled trigger,
popover calendar, `minDate` / `maxDate` constraints, localizable via a
`date-fns` locale. Range mode serializes to two hidden inputs
(`name_from`, `name_to`) when `name` is provided.

### Theming

Light theme is the default. Dark activates from the OS
`prefers-color-scheme: dark` preference, and the app can force either
theme with a class on `<html>`:

```html
<html>                   <!-- follow OS -->
<html class="dark">      <!-- force dark -->
<html class="light">     <!-- force light -->
```

All components adapt through the token system — no per-component
configuration needed.

### Tokens

Tokens are exposed as both CSS custom properties and Tailwind utility
classes. Prefer semantic utilities (`bg-background`,
`text-foreground`, `bg-primary`, `border-border`, …) — they flip with
the theme. Named-colour utilities (`bg-business-blue`, `bg-beige`, …)
are brand primitives that stay constant in both themes; use them only
when the colour itself is the intent.

## AI agents

This repo is built to be consumed by AI coding agents — Claude, Cursor,
Copilot, Windsurf, Cline, and friends. The on-ramp:

- **[AGENTS.md](AGENTS.md)** — generic agent guide (Cursor / Copilot /
  Windsurf / Cline). Start here.
- **[CLAUDE.md](CLAUDE.md)** — canonical engineering guide; AGENTS.md
  points at it for repo-specific conventions.
- **Storybook MCP server** at `http://localhost:6006/mcp` (run
  `npm run storybook` first). Registered for Claude Code via
  [`.mcp.json`](.mcp.json) at repo root; see [AGENTS.md](AGENTS.md) for
  Cursor / Windsurf snippets.
- **The non-negotiable rule:** never invent component props. Query
  `list-all-documentation` / `get-documentation` via the MCP before
  using any DS component.

## Local development

```bash
npm install
npm run storybook          # dev at http://localhost:6006
npm run build              # build library → dist/
npm run test               # unit tests (vitest, jsdom)
npm run test:coverage      # unit tests with coverage report
npm run build-storybook    # static Storybook → storybook-static/
```

## Release history

See [CHANGELOG.md](./CHANGELOG.md) for the full list of changes,
including the v0.1.x → v0.2.0 migration notes and the v0.3.0 dark-mode
release.
