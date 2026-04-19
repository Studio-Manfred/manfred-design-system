import type { Preview } from '@storybook/react-vite';
import { withThemeByClassName } from '@storybook/addon-themes';
import '../src/styles/fonts.css';
import '../src/tokens/tokens.css';

const preview: Preview = {
  parameters: {
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
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
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
