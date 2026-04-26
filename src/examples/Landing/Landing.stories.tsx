import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { PageBackground } from '@/components/PageBackground';
import { Container } from '@/components/Container';
import { Grid } from '@/components/Grid';
import { VStack, HStack } from '@/components/Stack';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/Card';
import { NavBar, NavItem } from '@/components/NavBar';
import { Alert } from '@/components/Alert';
import { Button } from '@/components/Button';
import { Spinner } from '@/components/Spinner';
import { Typography } from '@/components/Typography';
import { Icon } from '@/components/Icon';
import { Logo } from '@/components/Logo';
import { TextInput } from '@/components/TextInput';
import { FormField } from '@/components/FormField';

import { brand, footerLinks } from '../_shared/content';
import { heroCopy, features, ctaBanner } from './_fixtures';

/**
 * Examples/Landing — a marketing landing page composed only from public DS
 * exports.
 *
 * Pattern notes (sibling of Examples/Dashboard, Examples/Settings):
 *  - Landing pages don't use PageShell; they wrap everything in
 *    PageBackground (variant="warm") and place a single <main> between a
 *    marketing <header> and <footer>. landmark-one-main still passes.
 *  - One CSF meta with parameters.layout = 'fullscreen' + landmark-one-main
 *    re-enabled (mirrors Examples/Dashboard).
 *  - Four state stories: HappyPath / Empty / Loading / Error.
 *  - Heading order: h1 (hero) → h2 (feature/CTA section) → h3 (feature card).
 *  - Loading + Error reuse the HappyPath frames; fixed minHeights keep the
 *    layout from shifting between states.
 */

// ---------------------------------------------------------------------------
// Per-story a11y override: re-enable landmark-one-main for the page-level
// preview (globally disabled in .storybook/preview.ts). The runtime axe scan
// also re-enables this rule for `examples-*` story IDs in
// scripts/a11y-runtime-scan.mjs.
// ---------------------------------------------------------------------------

const enableLandmarkRule = {
  a11y: {
    config: {
      rules: [{ id: 'landmark-one-main', enabled: true }],
    },
  },
};

// ---------------------------------------------------------------------------
// Fixed heights so Loading/Error don't cause layout shift vs HappyPath.
// ---------------------------------------------------------------------------

const HERO_HEADING_MIN_HEIGHT = 168;
const FEATURE_CARD_BODY_MIN_HEIGHT = 112;

// ---------------------------------------------------------------------------
// Marketing header — non-sticky <header> with brand mark + auth CTAs.
// ---------------------------------------------------------------------------

function MarketingHeader() {
  return (
    <header className="border-b border-border/40">
      <Container size="xl" padded>
        <HStack
          as="div"
          justify="between"
          align="center"
          gap={4}
          className="h-16"
        >
          <Logo variant="wordmark" color="black" height={28} aria-label={brand.name} />
          <HStack gap={3} align="center">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
            <Button variant="brand" size="sm">
              Get started
            </Button>
          </HStack>
        </HStack>
      </Container>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Marketing footer — <footer> with brand mark + footer nav + copyright.
// ---------------------------------------------------------------------------

function MarketingFooter() {
  return (
    <footer className="border-t border-border/40 mt-16">
      <Container size="xl" padded>
        <VStack gap={6} className="py-10">
          <HStack justify="between" align="center" gap={6} wrap>
            <Logo variant="monogram" color="black" height={32} aria-label={brand.name} />
            <NavBar aria-label="Footer">
              {footerLinks.map((link) => (
                <NavItem key={link.href} href={link.href}>
                  {link.label}
                </NavItem>
              ))}
            </NavBar>
          </HStack>
          <Typography variant="caption" color="muted" as="span">
            (c) {new Date().getFullYear()} {brand.name}. All rights reserved.
          </Typography>
        </VStack>
      </Container>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// Shared shell — PageBackground wrapping header + main + footer.
// ---------------------------------------------------------------------------

interface LandingShellProps {
  children: React.ReactNode;
}

function LandingShell({ children }: LandingShellProps) {
  return (
    <PageBackground variant="warm">
      <MarketingHeader />
      <main>{children}</main>
      <MarketingFooter />
    </PageBackground>
  );
}

// ---------------------------------------------------------------------------
// Hero — heading + subheading + CTA row. Heading slot is swappable so
// Loading reuses the same frame with a Spinner instead of the headline.
// ---------------------------------------------------------------------------

interface HeroProps {
  heading?: React.ReactNode;
  ctas?: React.ReactNode;
}

function Hero({ heading, ctas }: HeroProps) {
  return (
    <section aria-labelledby="hero-heading">
      <Container size="xl" padded>
        <VStack
          gap={6}
          align="center"
          className="py-16 md:py-24 text-center"
        >
          <div
            className="flex items-center justify-center w-full max-w-3xl"
            style={{ minHeight: HERO_HEADING_MIN_HEIGHT }}
          >
            {heading ?? (
              <Typography
                variant="headline1"
                as="h1"
                color="default"
                className="max-w-3xl"
              >
                <span id="hero-heading">{heroCopy.heading}</span>
              </Typography>
            )}
          </div>
          <Typography variant="large" color="muted" className="max-w-2xl">
            {heroCopy.subheading}
          </Typography>
          {ctas}
        </VStack>
      </Container>
    </section>
  );
}

function HeroDefaultCtas() {
  return (
    <HStack gap={3} justify="center" wrap>
      <Button variant="brand" size="lg">
        {heroCopy.ctaPrimary}
      </Button>
      <Button variant="outline" size="lg">
        {heroCopy.ctaSecondary}
      </Button>
    </HStack>
  );
}

// ---------------------------------------------------------------------------
// Feature card — Icon + h3 title + body. Body has a minHeight so Loading and
// Error states don't shift the layout vs HappyPath.
// ---------------------------------------------------------------------------

interface FeatureCardProps {
  iconName?: React.ComponentProps<typeof Icon>['name'];
  title: string;
  titleId: string;
  children: React.ReactNode;
}

function FeatureCard({ iconName, title, titleId, children }: FeatureCardProps) {
  return (
    <Card as="article" padding="md" aria-labelledby={titleId}>
      <CardHeader>
        <HStack gap={3} align="center">
          {iconName ? (
            <span
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground"
              aria-hidden="true"
            >
              <Icon name={iconName} size="md" />
            </span>
          ) : null}
          <CardTitle id={titleId} as="h3">
            {title}
          </CardTitle>
        </HStack>
      </CardHeader>
      <CardContent
        className="flex items-start"
        style={{ minHeight: FEATURE_CARD_BODY_MIN_HEIGHT }}
      >
        {children}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// CTA banner — closing call-to-action card.
// ---------------------------------------------------------------------------

function CtaBannerSection() {
  return (
    <section aria-labelledby="cta-banner-heading">
      <Container size="xl" padded>
        <Card
          as="section"
          padding="lg"
          className="bg-accent text-accent-foreground border-transparent"
          aria-labelledby="cta-banner-heading"
        >
          <VStack gap={4} align="center" className="text-center py-6">
            <Typography variant="headline3" as="h2" id="cta-banner-heading">
              {ctaBanner.heading}
            </Typography>
            <Typography variant="body" color="default" className="max-w-2xl">
              {ctaBanner.sub}
            </Typography>
            <Button variant="primary" size="lg">
              {ctaBanner.cta}
            </Button>
          </VStack>
        </Card>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Features section — h2 heading + 3-column grid of feature cards.
// ---------------------------------------------------------------------------

interface FeaturesSectionProps {
  children: React.ReactNode;
}

function FeaturesSection({ children }: FeaturesSectionProps) {
  return (
    <section aria-labelledby="features-heading">
      <Container size="xl" padded>
        <VStack gap={8} className="py-12 md:py-16">
          <VStack gap={2} align="center" className="text-center">
            <Typography
              variant="headline2"
              as="h2"
              id="features-heading"
              className="max-w-2xl mx-auto"
            >
              Why teams pick Studio Manfred
            </Typography>
            <Typography variant="body" color="muted" className="max-w-2xl">
              We built the design system this site runs on. The same care goes
              into every project we ship.
            </Typography>
          </VStack>
          {children}
        </VStack>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// State bodies — composed by each story.
// ---------------------------------------------------------------------------

function HappyPathBody() {
  return (
    <>
      <Hero ctas={<HeroDefaultCtas />} />
      <FeaturesSection>
        <Grid cols={{ base: 1, md: 3 }} gap={6}>
          {features.map((feature, i) => (
            <FeatureCard
              key={feature.title}
              iconName={feature.iconName}
              title={feature.title}
              titleId={`feature-happy-${i}`}
            >
              <Typography variant="body" color="muted">
                {feature.description}
              </Typography>
            </FeatureCard>
          ))}
        </Grid>
      </FeaturesSection>
      <CtaBannerSection />
    </>
  );
}

function EmptyBody() {
  return (
    <>
      <Hero
        ctas={
          <VStack gap={4} align="center" className="w-full max-w-md">
            <Alert variant="info" title="Coming soon">
              Sign up below for early access. We will email you when the
              studio is taking on new projects.
            </Alert>
            <FormField label="Email" htmlFor="landing-empty-email">
              <TextInput
                id="landing-empty-email"
                type="email"
                placeholder="you@studio.example"
                fullWidth
              />
            </FormField>
            <Button variant="brand" size="lg">
              Notify me
            </Button>
          </VStack>
        }
      />
      <FeaturesSection>
        <Grid cols={1} gap={6}>
          <FeatureCard title="More to come" titleId="feature-empty-0">
            <Typography variant="body" color="muted">
              Features coming soon. We are still putting the finishing touches
              on this page.
            </Typography>
          </FeatureCard>
        </Grid>
      </FeaturesSection>
    </>
  );
}

function LoadingBody() {
  const loadingHeading = (
    <span className="inline-flex items-center justify-center" id="hero-heading">
      <Spinner size="lg" label="Loading landing page" />
    </span>
  );
  return (
    <>
      <Hero
        heading={loadingHeading}
        ctas={
          <HStack gap={3} justify="center" wrap>
            <Button variant="brand" size="lg" isLoading>
              {heroCopy.ctaPrimary}
            </Button>
            <Button variant="outline" size="lg" disabled>
              {heroCopy.ctaSecondary}
            </Button>
          </HStack>
        }
      />
      <FeaturesSection>
        <Grid cols={{ base: 1, md: 3 }} gap={6}>
          {features.map((feature, i) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              titleId={`feature-loading-${i}`}
            >
              <span className="flex w-full items-center justify-center">
                <Spinner size="md" label={`Loading ${feature.title}`} />
              </span>
            </FeatureCard>
          ))}
        </Grid>
      </FeaturesSection>
    </>
  );
}

function ErrorBody() {
  return (
    <>
      <Container size="xl" padded>
        <div className="pt-6">
          <Alert variant="error" title="Couldn't load page content">
            Try refreshing the page. If the problem persists, contact support.
          </Alert>
        </div>
      </Container>
      <Hero ctas={<HeroDefaultCtas />} />
      <FeaturesSection>
        <Grid cols={{ base: 1, md: 3 }} gap={6}>
          {features.map((feature, i) => (
            <FeatureCard
              key={feature.title}
              iconName={feature.iconName}
              title={feature.title}
              titleId={`feature-error-${i}`}
            >
              <Typography variant="body" color="muted">
                {feature.description}
              </Typography>
            </FeatureCard>
          ))}
        </Grid>
      </FeaturesSection>
      <CtaBannerSection />
    </>
  );
}

// ---------------------------------------------------------------------------
// Storybook meta + stories.
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: 'Examples/Landing',
  parameters: {
    layout: 'fullscreen',
    ...enableLandmarkRule,
  },
};
export default meta;

type Story = StoryObj;

export const HappyPath: Story = {
  render: () => (
    <LandingShell>
      <HappyPathBody />
    </LandingShell>
  ),
};

export const Empty: Story = {
  render: () => (
    <LandingShell>
      <EmptyBody />
    </LandingShell>
  ),
};

export const Loading: Story = {
  render: () => (
    <LandingShell>
      <LoadingBody />
    </LandingShell>
  ),
};

export const ErrorState: Story = {
  name: 'Error',
  render: () => (
    <LandingShell>
      <ErrorBody />
    </LandingShell>
  ),
};
