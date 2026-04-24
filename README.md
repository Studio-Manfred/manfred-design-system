# Manfred Design System

React component library for the Manfred product — brand tokens,
typography, and 17 accessible components built on
[shadcn/ui](https://ui.shadcn.com), Tailwind CSS v4, and Radix UI
primitives.

Published as `@studio-manfred/manfred-design-system` on GitHub Packages.

## Install

```bash
npm install @studio-manfred/manfred-design-system
```

Peer deps: `react >= 18`, `react-dom >= 18`.

Because the package is scoped to `@studio-manfred` on GitHub Packages,
authenticate npm to the GitHub registry first:

```
# .npmrc
@studio-manfred:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

For the full teammate onboarding (PAT scope, shell setup, CI examples,
troubleshooting), see [docs/CONSUMING.md](docs/CONSUMING.md).

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

The stylesheet bundles Tailwind v4 utilities, design tokens, and the
themed baseline — nothing else to wire up. Browse every component with
live examples in Storybook (`npm run storybook` locally; see below).

### Components

Alert · Badge · Breadcrumb · Button · Checkbox · DatePicker · Dialog ·
FormField · Icon · Logo · ProgressBar · RadioGroup · SearchBar ·
Spinner · TextInput · Toaster · Tooltip · Typography.

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
