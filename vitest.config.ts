import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vitest/config';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

import { playwright } from '@vitest/browser-playwright';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
  },
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: ['src/components/**/*.tsx', 'src/lib/**/*.ts'],
      exclude: [
        'src/**/*.stories.tsx',
        'src/**/*.test.{ts,tsx}',
        'src/**/index.ts',
      ],
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          environmentOptions: {
            jsdom: {
              // Required for jsdom to provide window.localStorage
              url: 'http://localhost',
            },
          },
          globals: true,
          include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.mjs'],
          setupFiles: ['./src/test/setup.ts'],
          css: true,
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          // Workaround for https://github.com/storybookjs/storybook/issues/33347
          // (vitest 4 + @vitest/browser-playwright + @storybook/addon-vitest):
          // browser tester disconnects after ~60-85s of silence with
          // `[birpc] rpc is closed, cannot call "createTesters"` under
          // parallel file execution. The upstream issue is labelled
          // "has workaround"; disable file parallelism on this project
          // only. Re-evaluate when addon-vitest pins to a vitest 4 RPC fix.
          fileParallelism: false,
          // Load preview.ts via setProjectAnnotations so addon-a11y receives
          // the full `parameters.a11y.config.rules` set when running in
          // 'error' mode. STU-131. Without this, only the top-level a11y
          // `test` parameter composes through; the rule disables get lost.
          setupFiles: ['./.storybook/vitest.setup.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
