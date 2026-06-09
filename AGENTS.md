# AGENTS.md

Generic on-ramp for AI coding agents (Claude, Cursor, Copilot,
Windsurf, Cline, …) working in this repo.

`@studio-manfred/manfred-design-system` is the Manfred React component
library — brand tokens, typography, and 30+ accessible components built
on [shadcn/ui](https://ui.shadcn.com), Tailwind CSS v4, and Radix UI.
Public Storybook: <https://studio-manfred.github.io/manfred-design-system/>.

## The non-negotiable rule

**Never invent component properties.** Before using ANY prop on a DS
component, verify it is documented for that component. Story names,
naming conventions, and patterns from other libraries are not a
substitute for the actual API. If a prop isn't documented, ask — don't
guess.

The mechanism for verifying is the Storybook MCP server below.

## Storybook MCP server

The DS exposes its component inventory, prop tables, and example stories
as machine-readable MCP tools over two endpoints. **Prefer the local
one; fall back to the published one when Storybook isn't running.**

### Primary — local (`http://localhost:6006/mcp`)

The full toolset, served by the running dev server. Start it once per
session:

```bash
npm run storybook            # serves on http://localhost:6006
```

Tools (call before using any DS component):

- **`list-all-documentation`** — full component inventory.
- **`get-documentation`** — props + example stories for a target
  component.
- **`get-storybook-story-instructions`** — current story-authoring
  conventions before creating or editing a `*.stories.tsx`.
- **`run-story-tests`** — verify after story changes.
- **`preview-stories`** — render previews to confirm visual results.

### Fallback — published (`https://main--6a26cfd37771192ff26832bf.chromatic.com/mcp`)

When Storybook isn't running locally, use the MCP that Chromatic
publishes on every `main` build. It's public (no auth) and current with
`main`, but serves the **docs toolset only** — `list-all-documentation`,
`get-documentation`, `get-documentation-for-story`. The interactive
`run-story-tests` / `preview-stories` are local-only (they need a live
Storybook). This is enough to verify props and inventory without
starting Storybook.

Only if **both** endpoints are unreachable, read component sources
directly under `src/components/<Name>/` and surface the unavailability to
the user — do **not** silently fall back to grepping or guessing.

## Registering the MCP in your agent

### Cursor

Add to `.cursor/mcp.json` (project-scoped) or `~/.cursor/mcp.json`
(user-scoped):

```json
{
  "mcpServers": {
    "manfred-design-system": {
      "url": "http://localhost:6006/mcp"
    }
  }
}
```

### Windsurf

Add to `.windsurf/mcp.json`:

```json
{
  "mcpServers": {
    "manfred-design-system": {
      "url": "http://localhost:6006/mcp"
    }
  }
}
```

### Claude Code

Already wired via the project-scoped [`.mcp.json`](.mcp.json) at repo
root. No further setup needed — Claude Code picks it up automatically.

### Generic clients (Cline, OpenAI MCP, …)

Point any MCP-compatible client at the streamable HTTP endpoint:

```
http://localhost:6006/mcp
```

### No local Storybook? Use the published endpoint

If you can't run the DS Storybook locally, register the MCP that
Chromatic publishes on every `main` build instead — public, no auth,
**docs toolset only**:

```
https://main--6a26cfd37771192ff26832bf.chromatic.com/mcp
```

## Working in this repo

- **Commands** — `npm run storybook`, `npm run test`, `npm run build`,
  `npm run build-storybook`. There is **no `lint`** and **no `dev`**
  script.
- **Architecture, conventions, accessibility policy, runtime axe scan,
  publishing pipeline** — see [CLAUDE.md](CLAUDE.md). It is the
  canonical engineering guide; everything in here is a generic-agent
  pointer at it.
- **Token system** — three-layer (`primitives → semantic → shadcn
  contract`), exposed as Tailwind utilities via `@theme inline` in
  [`src/tokens/tokens.css`](src/tokens/tokens.css). Never hardcode hex
  in components.
- **Tests** — `Component.test.tsx` lives next to `Component.tsx`. The
  unit project runs in jsdom; Storybook tests run in Chromium.

## Storybook play functions

Every interactive component has (or will have, by Wave 2) a play function asserting at least its tier baseline (A: smoke, B: smoke + interaction, C: full keyboard + ARIA). The mapping lives in [scripts/play-tiers.json](scripts/play-tiers.json) and is enforced by `npm run lint:play-tiers`. Authoring conventions: [docs/PLAY-FUNCTIONS.md](docs/PLAY-FUNCTIONS.md).

## Where to find more

- [README.md](README.md) — install + use as a consumer.
- [CLAUDE.md](CLAUDE.md) — full engineering guide (canonical).
- [CHANGELOG.md](CHANGELOG.md) — release history, including breaking
  changes and migration notes.
- [docs/PLAY-FUNCTIONS.md](docs/PLAY-FUNCTIONS.md) — play-function authoring guide and tier contract.
- Public Storybook — every component, every state, no install needed:
  <https://studio-manfred.github.io/manfred-design-system/>
