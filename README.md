# Manfred Design System

Brand tokens, typography, and core React components for the Manfred product, built on the
[shadcn/ui](https://ui.shadcn.com) framework — Tailwind CSS v4 + Radix UI primitives.

## Getting started

```bash
npm install
npm run storybook
```

Opens at [http://localhost:6006](http://localhost:6006).

---

## v0.2.0 — Breaking changes from 0.1.x

0.2.0 re-implements every component on Tailwind CSS v4 + Radix UI. The CSS Modules layer is
gone. Public APIs for four components moved to stock shadcn shapes:

| v0.1.x                                        | v0.2.0                                                                           |
|-----------------------------------------------|----------------------------------------------------------------------------------|
| `<Modal isOpen onClose>…</Modal>`             | `<Dialog open onOpenChange><DialogTrigger/><DialogContent/></Dialog>`            |
| `<Tooltip content="…">…</Tooltip>`            | `<TooltipProvider><Tooltip><TooltipTrigger/><TooltipContent/></Tooltip>`         |
| `<ToastContainer toasts onDismiss/>`+`useToast`| `<Toaster />` + `toast("…")` from sonner                                        |
| `<Radio name value />` (single)               | `<RadioGroup><RadioGroupItem value="a" label="A"/></RadioGroup>`                 |

`Checkbox` now forwards `onCheckedChange(state)` (Radix idiom) instead of the native
`onChange(event)`.

Consumers must also import the stylesheet:

```ts
import '@jens-wedin/design-system/styles';
```

---

## Project structure

```
src/
├── tokens/
│   └── tokens.css        # @import "tailwindcss" + primitives + semantic + shadcn contract + @theme
├── styles/
│   └── fonts.css         # @font-face declarations for Host Grotesk
├── lib/
│   └── utils.ts          # cn() helper (clsx + tailwind-merge)
├── assets/
│   └── fonts/            # Host Grotesk TTF files
├── components/           # Alert, Badge, Breadcrumb, Button, Checkbox, Dialog, FormField,
│                         # Icon, Logo, ProgressBar, Radio (RadioGroup), SearchBar, Spinner,
│                         # TextInput, Toast (Toaster+toast), Tooltip, Typography
└── index.ts              # Library barrel
```

---

## Design tokens

Tokens live in `src/tokens/tokens.css` as a three-layer architecture:

1. **Primitives** — raw scales (`--blue-500`, `--neutral-800`).
2. **Semantic** — brand-aware aliases (`--color-text-primary`,
   `--color-interactive-brand-bg`).
3. **shadcn contract** — `--background`, `--foreground`, `--primary`, `--accent`, `--muted`,
   `--destructive`, `--border`, `--ring`, mapped onto the semantic layer. This is what lets
   stock shadcn utilities (`bg-primary`, `text-foreground`, `ring-ring`) work.

A Tailwind v4 `@theme inline { … }` block exposes these as utility classes. No
`tailwind.config.js` is needed.

### Colors (brand)

| Token | Value | Usage |
|---|---|---|
| `--color-almost-black` | `#1e1e24` | Primary text, dark surfaces |
| `--color-business-blue` | `#2c28ec` | Brand primary, CTAs |
| `--color-human-pink` | `#efd6d3` | Warm accent surface |
| `--color-beige` | `#e6dcc8` | Neutral warm surface |
| `--color-light-beige` | `#f4f3e8` | Default warm background |
| `--color-white` | `#ffffff` | Default surface, inverse text |

### Typography

Font: **Host Grotesk**. Scale: `xs` (12px) → `5xl` (56px). Weights: 300 / 400 / 500 / 600 /
700 / 800.

### Spacing

4px base grid: `--space-1` (4px) through `--space-16` (64px).

---

## Components

### Button

```tsx
import { Button } from '@jens-wedin/design-system';

<Button variant="primary">Get started</Button>
<Button variant="brand" size="lg">Primary CTA</Button>
<Button variant="outline" isLoading>Saving…</Button>
<Button asChild><a href="/signup">As link</a></Button>
```

Variants: `primary` · `brand` · `outline` · `ghost` · `inverse` · Sizes: `sm` · `md` · `lg`.

### Dialog

```tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle,
  DialogDescription, DialogClose, Button } from '@jens-wedin/design-system';

<Dialog>
  <DialogTrigger asChild><Button>Open</Button></DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>This action cannot be undone.</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
      <DialogClose asChild><Button variant="brand">Confirm</Button></DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Tooltip

```tsx
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@jens-wedin/design-system';

<TooltipProvider delayDuration={200}>
  <Tooltip>
    <TooltipTrigger asChild><Button>Hover</Button></TooltipTrigger>
    <TooltipContent side="top">Helpful text</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Toast (sonner)

```tsx
import { Toaster, toast } from '@jens-wedin/design-system';

// Once in your app root:
<Toaster position="top-right" />

// Then anywhere:
toast.success('Saved!');
toast.error('Failed.', { description: 'Please retry.' });
```

### RadioGroup

```tsx
import { RadioGroup, RadioGroupItem } from '@jens-wedin/design-system';

<RadioGroup defaultValue="a">
  <RadioGroupItem id="a" value="a" label="Option A" />
  <RadioGroupItem id="b" value="b" label="Option B" />
</RadioGroup>
```

### Logo

```tsx
<Logo variant="wordmark" color="blue" height={48} />
<Logo variant="monogram" color="white" height={32} />
```

---

## Using tokens in your CSS

Import the stylesheet once — it contains Tailwind + all tokens:

```ts
import '@jens-wedin/design-system/styles';
```

Then use either Tailwind utilities or raw custom properties:

```css
.my-component {
  color: var(--color-business-blue);
  font-family: var(--font-family-base);
  padding: var(--space-4) var(--space-6);
}
```

Or Tailwind:

```tsx
<div className="bg-primary text-primary-foreground p-6 rounded-md">…</div>
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run storybook` | Start Storybook dev server at port 6006 |
| `npm run build-storybook` | Build static Storybook for deployment |
| `npm run build` | Build the library (`dist/`) |

---

## Reference files

The original brand assets live in `References/` and are not modified:

- `References/Brand Guidelines.pdf`
- `References/Fonts/Host Grotesk/`
- `References/Logotype/`
