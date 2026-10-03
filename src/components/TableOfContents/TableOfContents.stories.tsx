import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect, fn, waitFor } from 'storybook/test';
import {
  TableOfContents,
  type TableOfContentsItem,
  type TableOfContentsProps,
} from './TableOfContents';

const handbookItems: TableOfContentsItem[] = [
  { id: 'toc-vision', label: 'Vision', level: 2 },
  { id: 'toc-vision-why', label: 'Why it matters', level: 3 },
  { id: 'toc-mission', label: 'Mission', level: 2 },
  { id: 'toc-values', label: 'Values', level: 2 },
  { id: 'toc-values-care', label: 'Care', level: 3 },
  { id: 'toc-values-craft', label: 'Craft', level: 3 },
  { id: 'toc-contact', label: 'Who to ask', level: 2 },
];

const paragraph =
  'Studio Manfred designs and builds digital services with the people who ' +
  'use them. This paragraph is filler so the page is long enough to scroll ' +
  'and the active section can follow the reader down the page.';

/** A long page with real headings (tabIndex -1 + scroll margin) next to the TOC. */
function HandbookPage(args: TableOfContentsProps) {
  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_14rem]">
      <article className="flex flex-col gap-4 text-foreground">
        {args.items.map((item) => {
          const Heading = item.level === 3 ? 'h3' : 'h2';
          return (
            <section key={item.id} className="flex flex-col gap-3">
              <Heading
                id={item.id}
                tabIndex={-1}
                className={
                  item.level === 3
                    ? 'scroll-mt-4 text-lg font-semibold'
                    : 'scroll-mt-4 text-2xl font-semibold'
                }
              >
                {item.label}
              </Heading>
              {[0, 1, 2].map((n) => (
                <p key={n} className="text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </section>
          );
        })}
      </article>
      <aside className="md:sticky md:top-4 md:self-start">
        <TableOfContents {...args} />
      </aside>
    </div>
  );
}

const meta: Meta<typeof TableOfContents> = {
  title: 'Components/TableOfContents',
  component: TableOfContents,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '"On this page" navigation for a long page, usually in a sticky ' +
          'right-hand column. One link per heading, subsections nested under ' +
          'their section. The section being read gets a brand-colour bar, ' +
          'bolder text and `aria-current="location"` (never colour alone). ' +
          'By default it follows the scroll position with an ' +
          '`IntersectionObserver`; pass `activeId` to control it yourself.\n\n' +
          'Clicking a link scrolls to the heading (smoothly unless the user ' +
          'prefers reduced motion) and moves focus to it. **Give each heading ' +
          '`tabIndex={-1}`** so it can take focus, and a `scroll-margin-top` ' +
          'equal to `offsetTop` if a sticky header covers the top of the page. ' +
          'Cmd / Ctrl / Shift and middle-clicks behave like normal links. ' +
          'A final section too short to scroll up to the `offsetTop` line ' +
          'only becomes active when its link is clicked. ' +
          'Renders a `<nav>` labelled by its visible title.',
      },
    },
  },
  argTypes: {
    items: {
      control: 'object',
      description:
        '`{ id, label, level: 1 | 2 | 3 }[]` in page order. `id` is the id of ' +
        'a heading already in the DOM. Levels are relative: a higher level ' +
        'than the previous item nests one step under it, so pass heading ' +
        'levels straight through (h2 → 2, h3 → 3). An empty list renders nothing.',
    },
    activeId: {
      control: 'text',
      description:
        'Controlled active section (`id`), or `null` for none. Leave unset for ' +
        'built-in scroll tracking. Without `IntersectionObserver` (SSR, jsdom) ' +
        'there is no tracking, only the last clicked link.',
    },
    offsetTop: {
      control: { type: 'number', min: 0 },
      description:
        'Height in px of a sticky header. A section becomes active when its ' +
        'heading scrolls up to this line. Match it with `scroll-margin-top` ' +
        'on the headings.',
      table: { defaultValue: { summary: '0' } },
    },
    label: {
      control: 'text',
      description: 'Visible title; also names the navigation landmark.',
      table: { defaultValue: { summary: 'On this page' } },
    },
    onNavigate: {
      control: false,
      description:
        '`(id) => void`, called after a link click has scrolled to and ' +
        'focused the heading, e.g. to update the URL hash. The component ' +
        'does not change the URL itself.',
      table: { type: { summary: '(id: string) => void' } },
    },
  },
};

export default meta;

type Story = StoryObj<typeof TableOfContents>;

export const OnALongPage: Story = {
  args: {
    items: handbookItems,
    onNavigate: fn(),
  },
  render: (args) => <HandbookPage {...args} />,
  parameters: {
    docs: {
      description: {
        story:
          'Built-in tracking next to a long page. Scroll the canvas: the ' +
          'highlight follows the last heading that reached the top. Click a ' +
          'link to scroll there and move focus to the heading.',
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    // The nav is a landmark named by its visible title.
    const nav = canvas.getByRole('navigation', { name: 'On this page' });
    const toc = within(nav);
    // One link per item, each pointing at its heading.
    expect(toc.getAllByRole('link')).toHaveLength(handbookItems.length);
    const mission = toc.getByRole('link', { name: 'Mission' });
    expect(mission).toHaveAttribute('href', '#toc-mission');

    // Clicking moves focus to the heading and marks the link as the current location.
    await userEvent.click(mission);
    await waitFor(() => expect(canvas.getByRole('heading', { name: 'Mission' })).toHaveFocus());
    expect(mission).toHaveAttribute('aria-current', 'location');
    // onNavigate reports the id.
    expect(args.onNavigate).toHaveBeenCalledWith('toc-mission');

    // Keyboard: focus a link, Tab to the next one, Enter follows it.
    const values = toc.getByRole('link', { name: 'Values' });
    values.focus();
    await waitFor(() => expect(values).toHaveFocus());
    await userEvent.tab();
    const care = toc.getByRole('link', { name: 'Care' });
    await waitFor(() => expect(care).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    // Enter moves focus to the Care heading, nested under Values.
    await waitFor(() => expect(canvas.getByRole('heading', { name: 'Care' })).toHaveFocus());
    expect(care).toHaveAttribute('aria-current', 'location');
    // Only one link is current at a time.
    expect(mission).not.toHaveAttribute('aria-current');
  },
};

export const Controlled: Story = {
  args: {
    items: [
      { id: 'ctl-intro', label: 'Introduction', level: 1 },
      { id: 'ctl-setup', label: 'Setting up', level: 1 },
      { id: 'ctl-setup-access', label: 'Access and accounts', level: 2 },
      { id: 'ctl-setup-tools', label: 'Tools', level: 2 },
      { id: 'ctl-first-week', label: 'Your first week', level: 1 },
    ],
    activeId: 'ctl-setup-access',
    label: 'Contents',
  },
  render: (args) => (
    <div className="max-w-56">
      <TableOfContents {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Controlled: `activeId` decides the highlight (here a subsection) ' +
          'and no observer runs. Also shows a custom `label`. Use it when the ' +
          'app already knows the section, e.g. from its own scroll state.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // A custom label names the landmark.
    const nav = canvas.getByRole('navigation', { name: 'Contents' });
    // The controlled id is the current location; its parent is not.
    expect(within(nav).getByRole('link', { name: 'Access and accounts' })).toHaveAttribute(
      'aria-current',
      'location',
    );
    expect(within(nav).getByRole('link', { name: 'Setting up' })).not.toHaveAttribute('aria-current');
  },
};
