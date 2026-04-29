import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Container,
  DatePicker,
  FormField,
  Grid,
  HStack,
  NavBar,
  NavItem,
  PageBackground,
  PageBody,
  PageFooter,
  PageHeader,
  PageShell,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
  TextInput,
  Typography,
  VStack,
} from '../..';
import { brand, footerLinks, mockUser, navItems } from '../_shared/content';
import {
  categoryOptions,
  errorMessages,
  happyPathDefaults,
  leadOptions,
  notificationPrefs,
  visibilityOptions,
  type FormDefaults,
} from './_fixtures';

const enableLandmarkRule = {
  a11y: {
    config: {
      rules: [{ id: 'landmark-one-main', enabled: true }],
    },
  },
};

const meta: Meta = {
  title: 'Examples/AdvancedForm',
  parameters: {
    layout: 'fullscreen',
    ...enableLandmarkRule,
  },
};
export default meta;

type Story = StoryObj;

type FormState = 'happy' | 'empty' | 'loading' | 'error';

const SECTION_BODY_MIN_HEIGHT = 220;

interface DemoShellProps {
  activeNav?: string;
  children: React.ReactNode;
}

const DemoShell = ({ activeNav = 'Reports', children }: DemoShellProps) => (
  <PageShell>
    <PageHeader sticky>
      <Container size="xl" padded>
        <HStack justify="between" align="center" gap={6} className="py-3">
          <HStack gap={6} align="center">
            <Typography variant="label" as="span">
              {brand.appName}
            </Typography>
            <NavBar aria-label="Primary">
              {navItems.map((item) => (
                <NavItem key={item.label} href={item.href} active={item.label === activeNav}>
                  {item.label}
                </NavItem>
              ))}
            </NavBar>
          </HStack>
          <Avatar alt={mockUser.name} initials={mockUser.initials} size="sm" />
        </HStack>
      </Container>
    </PageHeader>

    <PageBody padded>
      <Container size="md" padded={false}>
        <VStack gap={6} className="py-8">
          {children}
        </VStack>
      </Container>
    </PageBody>

    <PageFooter>
      <Container size="xl" padded>
        <HStack justify="between" align="center" gap={4} className="py-4 text-muted-foreground">
          <Typography variant="caption">© {new Date().getFullYear()} {brand.name}</Typography>
          <HStack as="ul" gap={4} className="list-none p-0 m-0">
            {footerLinks.map((link) => (
              <HStack as="li" key={link.label} gap={0}>
                <NavItem href={link.href}>{link.label}</NavItem>
              </HStack>
            ))}
          </HStack>
        </HStack>
      </Container>
    </PageFooter>
  </PageShell>
);

const PageHeading = () => (
  <VStack gap={2}>
    <HStack gap={3} align="center" wrap>
      <Typography variant="headline3" as="h1">
        Create a project
      </Typography>
      <Badge variant="secondary" size="sm">Draft</Badge>
    </HStack>
    <Typography variant="body" color="muted">
      Set up the basics, schedule, and access for a new initiative inside {brand.name}. You can
      invite collaborators and configure integrations after the project is created.
    </Typography>
  </VStack>
);

interface SectionCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  minHeight?: number;
}

const SectionCard = ({ title, description, children, minHeight }: SectionCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle as="h2">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <div style={minHeight ? { minHeight } : undefined}>{children}</div>
    </CardContent>
  </Card>
);

const LoadingPlaceholder = ({ height = SECTION_BODY_MIN_HEIGHT }: { height?: number }) => (
  <HStack justify="center" align="center" style={{ minHeight: height }}>
    <Spinner size="md" />
  </HStack>
);

interface FormBodyProps {
  state: FormState;
  defaults: FormDefaults;
}

const ProjectBasics = ({ state, defaults }: FormBodyProps) => {
  if (state === 'loading') return <SectionCardLoading title="Project basics" description="Name, slug, and short tagline." />;
  return (
    <SectionCard
      title="Project basics"
      description="Name, slug, and a short tagline that everyone will see in lists and notifications."
    >
      <VStack gap={4}>
        <FormField
          label="Project name"
          htmlFor="af-name"
          required
          status={state === 'error' ? 'error' : 'default'}
          message={state === 'error' ? errorMessages.name : undefined}
        >
          <TextInput
            id="af-name"
            placeholder="e.g. Manfred Design System v1.0"
            defaultValue={state === 'empty' ? '' : defaults.name}
            status={state === 'error' ? 'error' : 'default'}
            fullWidth
          />
        </FormField>

        <FormField
          label="Slug"
          htmlFor="af-slug"
          status={state === 'error' ? 'error' : 'hint'}
          message={
            state === 'error' ? errorMessages.slug : 'Used in URLs and integrations. Auto-generated, editable.'
          }
        >
          <TextInput
            id="af-slug"
            leadingIcon="external-link"
            placeholder="manfred-design-system-v1"
            defaultValue={state === 'empty' ? '' : defaults.slug}
            status={state === 'error' ? 'error' : 'default'}
            fullWidth
          />
        </FormField>

        <FormField
          label="Tagline"
          htmlFor="af-tagline"
          status="hint"
          message="One sentence — appears under the project name in dashboards."
        >
          <TextInput
            id="af-tagline"
            placeholder="Ship the first stable release of the shared component library."
            defaultValue={state === 'empty' ? '' : defaults.tagline}
            fullWidth
          />
        </FormField>
      </VStack>
    </SectionCard>
  );
};

const ScheduleSection = ({ state, defaults }: FormBodyProps) => {
  if (state === 'loading') return <SectionCardLoading title="Schedule" description="Start and due dates." />;
  return (
    <SectionCard
      title="Schedule"
      description="When the project starts and when it's due. Due date can't be earlier than start."
    >
      <Grid cols={{ base: 1, md: 2 }} gap={4}>
        <FormField label="Start date" htmlFor="af-start" required>
          <DatePicker
            id="af-start"
            value={state === 'empty' ? undefined : defaults.startDate}
            placeholder="Pick a start date"
          />
        </FormField>
        <FormField
          label="Due date"
          htmlFor="af-due"
          required
          status={state === 'error' ? 'error' : 'default'}
          message={state === 'error' ? errorMessages.dueDate : undefined}
        >
          <DatePicker
            id="af-due"
            value={state === 'empty' ? undefined : defaults.dueDate}
            minDate={state === 'empty' ? undefined : defaults.startDate}
            status={state === 'error' ? 'error' : 'default'}
            placeholder="Pick a due date"
          />
        </FormField>
      </Grid>
    </SectionCard>
  );
};

const TeamSection = ({ state, defaults }: FormBodyProps) => {
  if (state === 'loading') return <SectionCardLoading title="Team & access" description="Lead, visibility, notifications." />;
  return (
    <SectionCard
      title="Team & access"
      description="Pick the project lead, set who can see this project, and choose what triggers notifications."
    >
      <VStack gap={5}>
        <FormField label="Project lead" htmlFor="af-lead" required>
          <Select defaultValue={state === 'empty' ? undefined : defaults.lead}>
            <SelectTrigger id="af-lead" aria-label="Project lead" fullWidth>
              <SelectValue placeholder="Choose a project lead" />
            </SelectTrigger>
            <SelectContent>
              {leadOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Category" htmlFor="af-category">
          <Select defaultValue={state === 'empty' ? undefined : defaults.category}>
            <SelectTrigger id="af-category" aria-label="Category" fullWidth leadingIcon="search">
              <SelectValue placeholder="Choose a category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Visibility" htmlFor="af-visibility">
          <RadioGroup defaultValue={state === 'empty' ? 'private' : defaults.visibility}>
            <VStack gap={2}>
              {visibilityOptions.map((opt) => (
                <VStack key={opt.value} gap={1}>
                  <RadioGroupItem
                    id={`af-vis-${opt.value}`}
                    value={opt.value}
                    label={opt.label}
                  />
                  <Typography variant="caption" color="muted" className="ml-7">
                    {opt.description}
                  </Typography>
                </VStack>
              ))}
            </VStack>
          </RadioGroup>
        </FormField>

        <VStack gap={2}>
          <Typography variant="label" as="span">
            Notify the team about
          </Typography>
          <Grid cols={{ base: 1, md: 2 }} gap={2}>
            {notificationPrefs.map((pref) => (
              <Checkbox
                key={pref.id}
                label={pref.label}
                defaultChecked={state === 'empty' ? false : pref.defaultChecked}
              />
            ))}
          </Grid>
        </VStack>
      </VStack>
    </SectionCard>
  );
};

const SectionCardLoading = ({ title, description }: { title: string; description: string }) => (
  <SectionCard title={title} description={description}>
    <LoadingPlaceholder />
  </SectionCard>
);

const ActionBar = ({ state }: { state: FormState }) => (
  <HStack justify="between" align="center" wrap gap={3}>
    <Typography variant="bodySmall" color="muted">
      Drafts auto-save every 30 seconds.
    </Typography>
    <HStack gap={3} wrap>
      <Button variant="ghost" disabled={state === 'loading'}>
        Cancel
      </Button>
      <Button variant="outline" disabled={state === 'loading'}>
        Save draft
      </Button>
      <Button variant="brand" disabled={state === 'loading'}>
        {state === 'loading' ? (
          <HStack gap={2} align="center">
            <Spinner size="sm" />
            <span>Creating…</span>
          </HStack>
        ) : (
          'Create project'
        )}
      </Button>
    </HStack>
  </HStack>
);

interface FormPageProps {
  state: FormState;
  banner?: React.ReactNode;
}

const FormPage = ({ state, banner }: FormPageProps) => (
  <DemoShell>
    <PageHeading />
    {banner}
    <ProjectBasics state={state} defaults={happyPathDefaults} />
    <ScheduleSection state={state} defaults={happyPathDefaults} />
    <TeamSection state={state} defaults={happyPathDefaults} />
    <Card>
      <CardFooter>
        <ActionBar state={state} />
      </CardFooter>
    </Card>
  </DemoShell>
);

export const HappyPath: Story = {
  render: () => <FormPage state="happy" />,
};

export const Empty: Story = {
  render: () => (
    <FormPage
      state="empty"
      banner={
        <Alert variant="info" title="Start with the basics">
          Give your project a name to unlock the rest of the form. Slug auto-generates from the
          name; you can edit it before saving.
        </Alert>
      }
    />
  ),
};

export const Loading: Story = {
  render: () => (
    <FormPage
      state="loading"
      banner={
        <Alert variant="info" title="Saving your project">
          Hang tight — we're creating the project workspace and inviting the team.
        </Alert>
      }
    />
  ),
};

export const ErrorState: Story = {
  name: 'Error',
  render: () => (
    <FormPage
      state="error"
      banner={
        <Alert variant="error" title="Couldn't create the project">
          {errorMessages.banner}
        </Alert>
      }
    />
  ),
};
