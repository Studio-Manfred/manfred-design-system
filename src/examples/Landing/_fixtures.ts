/**
 * Studio Manfred-flavoured copy for the Landing demo.
 *
 * This is marketing-page copy: hero, three feature cards, and a closing CTA
 * banner. Voice mirrors the Studio Manfred internal-tools brand — pragmatic,
 * Swedish design studio, no lorem.
 */

import type { IconName } from '@/components/Icon';

export interface HeroCopy {
  heading: string;
  subheading: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

export const heroCopy: HeroCopy = {
  heading: 'Internal tools, designed like a product.',
  subheading:
    'Studio Manfred builds the dashboards, reports, and admin surfaces your team uses every day — with the same care as the customer-facing ones.',
  ctaPrimary: 'Start a project',
  ctaSecondary: 'See our work',
};

export interface Feature {
  iconName: IconName;
  title: string;
  description: string;
}

export const features: readonly Feature[] = [
  {
    iconName: 'check-circle',
    title: 'Designed end-to-end',
    description:
      'One team owns research, design, and implementation. No handover gaps, no drifted Figma files, no half-shipped flows.',
  },
  {
    iconName: 'eye',
    title: 'Built on a real design system',
    description:
      'Every screen rides on the Manfred Design System — token-driven, accessible by default, and Storybook-documented.',
  },
  {
    iconName: 'arrow-right',
    title: 'Shipped, not just specced',
    description:
      'We work in production code from day one. The deliverable is a running app on your stack, not a deck of mockups.',
  },
];

export interface CtaBanner {
  heading: string;
  sub: string;
  cta: string;
}

export const ctaBanner: CtaBanner = {
  heading: 'Ready to ship internal tools your team actually likes?',
  sub: 'Tell us what you are building. We will reply within two working days.',
  cta: 'Get in touch',
};
