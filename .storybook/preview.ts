import type { Preview } from '@storybook/react-vite';
import { withThemeByClassName } from '@storybook/addon-themes';
import isChromatic from 'chromatic/isChromatic';
import '../src/styles/fonts.css';
import '../src/tokens/tokens.css';

// Chromatic pauses CSS animations at their final frame for snapshot
// stability, which freezes Radix's enter/exit transitions mid-flight and
// stalls the animation-driven mount/unmount its primitives depend on.
// Interaction tests that assert open-visibility or close-removal (Dialog,
// Sheet, Tooltip, SplitButton) then fail in Chromatic even though they pass
// in `test:storybook`. Disabling animations *only* in Chromatic's capture
// browser makes mount/unmount synchronous so those play assertions hold.
// `isChromatic()` is false in the dev server and the vitest browser runner,
// so this is a no-op everywhere else; it complements the `motion-safe:`
// convention rather than replacing it.
if (typeof document !== 'undefined' && isChromatic()) {
  const style = document.createElement('style');
  style.setAttribute('data-disable-animations', 'chromatic');
  style.textContent =
    '*, *::before, *::after { animation: none !important; transition: none !important; }';
  document.head.appendChild(style);
}

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      source: { type: 'code', excludeDecorators: true },
    },
    options: {
      storySort: {
        order: [
          'Welcome',
          'Foundation', ['Tokens', 'Typography', 'Logo', 'Theming', 'Accessibility', 'Motion', 'FormPatterns'],
          'Layout', ['Stack', 'Container', 'Grid', 'PageShell', 'PageBackground'],
          'Components',
          'Examples',
        ],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    backgrounds: {
      options: {
        white: { name: 'white',       value: '#ffffff' },
        light_beige: { name: 'light beige', value: '#f4f3e8' },
        beige: { name: 'beige',       value: '#e6dcc8' },
        human_pink: { name: 'human pink',  value: '#efd6d3' },
        dark: { name: 'dark',        value: '#1e1e24' },
        brand_blue: { name: 'brand blue',  value: '#2c28ec' }
      }
    },

    a11y: {
      // 'error' - fail CI on a11y violations (STU-131, v0.20.x)
      // 'todo'  - show violations in the test UI only (legacy, do not regress)
      // 'off'   - skip a11y checks entirely
      test: 'error',
      config: {
        rules: [
          // Stories render in isolation (no <main>, no <h1>, no landmark wrapping).
          // These page-level axe rules do not apply to component-in-iframe previews;
          // consumers are responsible for landmarks in their own app shell.
          //
          // Keep this list in sync with GLOBAL_DISABLED_RULES in
          // scripts/a11y-runtime-scan.mjs — the CLI scan hardcodes the
          // same suppressions so its output matches this panel.
          { id: 'region', enabled: false },
          { id: 'landmark-one-main', enabled: false },
          { id: 'page-has-heading-one', enabled: false },
          { id: 'bypass', enabled: false },
        ],
      },
    }
  },

  decorators: [
    withThemeByClassName({
      // 'system' maps to no class so the OS preference
      // (prefers-color-scheme) wins. 'light'/'dark' set
      // an explicit class on <html> that overrides it.
      themes: { system: '', light: 'light', dark: 'dark' },
      defaultTheme: 'system',
      parentSelector: 'html',
    }),
  ],
};

export default preview;
