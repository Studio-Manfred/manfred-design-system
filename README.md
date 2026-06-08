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

### Next.js App Router (RSC)

From v0.23.0 the bundled dist entry ships with a `"use client"`
directive at the top, so you can import DS exports directly from
Server Components in a Next 16 App Router project:

```tsx
// app/page.tsx — Server Component by default
import { Button } from '@studio-manfred/manfred-design-system';

export default function Home() {
  return <Button>OK</Button>;
}
```

No consumer-side client-boundary shim required. Existing client
components (anywhere you already write `"use client"` at the top of
the file) keep working unchanged. The whole library is marked
client-side — the convention used by shadcn/ui, MUI, and Mantine — so
every DS import contributes to the consumer's client bundle.

### Tailwind v4 utilities in your own code

If your app uses Tailwind v4 and you want to write
`bg-muted`, `text-muted-foreground`, `bg-accent`, `bg-card`,
`bg-popover`, `bg-destructive`, `border-border`, `ring-ring`, etc.
in your own components, add a second import to your Tailwind input CSS:

```css
/* app/globals.css (or wherever you @import "tailwindcss") */
@import "tailwindcss";
@import "@studio-manfred/manfred-design-system/tokens.css";

/* Scan the DS's compiled output so your Tailwind regenerates the utility
   classes used *inside* DS components — including responsive/arbitrary
   variants like `md:flex` and `[&>*]:w-full`. Adjust the relative path so
   it resolves to the installed package in your node_modules. */
@source "../node_modules/@studio-manfred/manfred-design-system/dist";
```

This exposes the shadcn-shape token contract to your Tailwind utility
generator. Without it, those utilities compile to nothing in your build
(the `@theme` block lives in the DS source CSS but is consumed at our
build time, so it doesn't reach your Tailwind from the bundled stylesheet).
Keep `import '@studio-manfred/manfred-design-system/styles';` at the app
entry too — `tokens.css` is the Tailwind-input side; `styles` is the
runtime component CSS.

> **The `@source` line is not optional if you run your own Tailwind.**
> Tailwind v4 ignores `node_modules` by default, so it never generates the
> responsive/arbitrary utilities that appear only inside DS component source.
> The DS's own `styles` bundle has them, but in your final CSS it loads
> *before* your Tailwind output, so your base utilities (e.g. `.hidden`) can
> win the cascade over the DS's `md:flex` — silently hiding a component's
> responsive parts. This bites **only in production builds** (dev injects CSS
> in a different order). Symptom seen in the wild: `AppHeader`'s desktop
> cluster (nav/search/actions) rendered invisible, leaving just the logo.
> Adding `@source` regenerates those utilities in your own layer and fixes it.

### Components

Accordion · Alert · AppHeader · Avatar · Badge · Breadcrumb · Button · Card ·
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

For consumers who want a custom theme switcher outside of `AppHeader`,
the DS exports a `useThemeToggle` hook from the same module:

```tsx
import { useThemeToggle } from '@studio-manfred/manfred-design-system';

function MyToggle() {
  const { resolved, toggle } = useThemeToggle();
  return <button onClick={toggle}>{resolved === 'dark' ? '☀️' : '🌙'}</button>;
}
```

It persists the preference to `localStorage('manfred-theme')` and applies
the class on `<html>`. SSR-safe.

### Tokens

Tokens are exposed as both CSS custom properties and Tailwind utility
classes. Prefer semantic utilities (`bg-background`,
`text-foreground`, `bg-primary`, `border-border`, …) — they flip with
the theme. Named-colour utilities (`bg-business-blue`, `bg-beige`, …)
are brand primitives that stay constant in both themes; use them only
when the colour itself is the intent.

### Links and prose

Tailwind v4 Preflight strips the browser's default underline and
link colour from `<a>`, so the DS owns the brand link decision via
four Layer 2 tokens plus a small wrapper class:

```css
--color-text-link                /* brand-blue on white/cream (--blue-300 dark) */
--color-text-link-hover          /* --blue-600 (--blue-200 dark) */
--color-text-link-on-brand       /* --pink on brand-blue (identity-fixed) */
--color-text-link-on-brand-hover /* --white on brand-blue (identity-fixed) */
```

Wrap any prose surface in `<div className="manfred-prose">…</div>`
and every nested `<a>` picks up the brand colour, underline, and 4px
offset automatically. Add `manfred-prose--on-brand` alongside it on
brand-blue surfaces to switch the palette to peach.

```jsx
<div className="manfred-prose">
  <p>Read more about <a href="/mission">our mission</a>.</p>
</div>

<div className="manfred-prose manfred-prose--on-brand bg-business-blue">
  <p>Say hi to <a href="mailto:hi@studiomanfred.com">the team</a>.</p>
</div>
```

This is the only path that reaches `<a>` tags inside CMS HTML
rendered through React's raw-HTML escape hatch — a JSX `<Link>`
primitive can't touch that content. Anchor-only for v1 (no heading
or list styling yet).

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
