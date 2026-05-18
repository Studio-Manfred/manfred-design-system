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
//
// NOTE: do NOT pass an array form with `@storybook/addon-a11y/preview`
// prepended. Under @storybook/addon-vitest@10.4.x, that re-introduces the
// addon's default `parameters.a11y = { test: 'todo' }` and shallow-merges
// over our `config.rules` — region / landmark-one-main start firing again.
// The single-arg form below is what works in 10.4.x.
import { setProjectAnnotations } from '@storybook/react-vite';
import * as projectAnnotations from './preview';

setProjectAnnotations(projectAnnotations);
