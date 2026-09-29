# Errors — manfred-design-system

Project-local error log.

- **Deterministic errors** (bad schema, wrong type, missing field) → conclude
  immediately, fix, link the conclusion into a category file.
- **Infrastructure errors** (timeout, rate limit, network) → log only; no
  conclusion until a pattern emerges.

Format:

```markdown
## YYYY-MM-DD — short title

- **Symptom:**
- **Cause:**
- **Fix / conclusion:**
- **Graduated to:** knowledge/<category> or manfred-bootstrap/docs/knowledge/ (when recurring)
```

---

## 2026-09-29 — publish fails: value-only export flagged "has no props" by build-manifest.mjs

- **Symptom:** GitHub Actions `publish.yml` fails during the `Build library`
  step (specifically `npm run build`'s postbuild), with:

  ```
  ✗ DEFAULT_COLOR_PICKER_PALETTE has no props (docgen likely lost its type: add a
    PROP_OVERRIDES entry, or HTML_WRAPPER_COMPONENTS with a reason if it is a pure
    HTML wrapper)
  ##[error]Process completed with exit code 1.
  ```

  `dist/index.mjs` / `dist/index.cjs` are built cleanly; only the postbuild
  manifest sidecar step trips.

- **Cause:** `scripts/build-manifest.mjs` treats every top-level export in
  `src/index.ts` as a documented component and expects it to have a props
  type. A value-only export (constant array, helper function) fails the
  "no props" check because docgen finds no component type to introspect.
  Neither `PROP_OVERRIDES` (for components whose types docgen lost) nor
  `HTML_WRAPPER_COMPONENTS` (for HTML passthroughs like `Container`) fits
  value exports.

- **Fix / conclusion:** don't re-export values from `src/index.ts`. Options:
  1. **Component-local only** (recommended). Keep the constant in
     `src/components/<Component>/index.ts` and let consumers deep-import if
     they need it. Public API is via props, not shared constants.
  2. **Move to `src/tokens/`** if it's tokens-adjacent (the tokens re-export
     goes through `src/tokens/index.ts`, which the manifest treats
     separately).
  3. Wrap in a component if it's genuinely a slot users compose (unlikely
     for a plain constant).

  **STU-979 (2026-09-29):** exported `DEFAULT_COLOR_PICKER_PALETTE` from
  `src/index.ts`; v0.37.0's publish failed; patch release v0.37.1 dropped
  the top-level re-export. Constant still exists in
  `src/components/ColorPicker/index.ts`; consumers who need to spread the
  default palette can define their own small array via the `palette` prop.

- **Graduated to:** local only for now. First sighting; graduate to
  `manfred-bootstrap/docs/knowledge/gotchas.md` on the second.
