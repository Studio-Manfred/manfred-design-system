// Storybook + addon-vitest: explicit project-annotations bridge.
//
// Without this, `npm run test:storybook` reaches the addon-a11y `afterEach`
// with only the top-level `parameters.a11y.test` value composed in — the
// `parameters.a11y.config.rules` block from preview.ts gets lost in the
// implicit annotation merge, leaving `region` / `landmark-one-main` rules
// firing against component-in-iframe previews where landmarks are not
// expected. Calling `setProjectAnnotations` directly loads the full preview
// (parameters, decorators, globals) into every play function's story
// context — same merge path Storybook itself uses.
//
// Added in STU-131 alongside the `a11y.test: 'error'` flip. If you remove
// this file, the addon-a11y rule disables in preview.ts stop applying.
import { setProjectAnnotations } from '@storybook/react-vite';
import * as projectAnnotations from './preview';

setProjectAnnotations(projectAnnotations);
