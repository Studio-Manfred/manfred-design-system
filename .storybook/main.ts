import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
    '@storybook/addon-mcp'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  staticDirs: ['../src/assets'],
  viteFinal: async (config, { configType }) => {
    if (configType === 'PRODUCTION') {
      config.base = process.env.STORYBOOK_BASE_HREF ?? '/manfred-design-system/';
    }
    return config;
  },
};

export default config;
