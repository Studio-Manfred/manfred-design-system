/**
 * Fixtures for the Examples/AdvancedForm demo — a "Create project" form
 * that exercises FormField + TextInput + Select + Checkbox + RadioGroup +
 * DatePicker together with cross-field state (start/due dates), inline
 * validation, and a summary footer.
 */

export type CategoryOption = { value: string; label: string };

export const categoryOptions: readonly CategoryOption[] = [
  { value: 'design', label: 'Design system' },
  { value: 'product', label: 'Product launch' },
  { value: 'research', label: 'Research initiative' },
  { value: 'internal', label: 'Internal tooling' },
  { value: 'marketing', label: 'Marketing campaign' },
] as const;

export type VisibilityOption = {
  value: 'private' | 'internal' | 'public';
  label: string;
  description: string;
};

export const visibilityOptions: readonly VisibilityOption[] = [
  {
    value: 'private',
    label: 'Private',
    description: 'Only invited members can view this project.',
  },
  {
    value: 'internal',
    label: 'Internal',
    description: 'Anyone in Studio Manfred can view, only invited can edit.',
  },
  {
    value: 'public',
    label: 'Public',
    description: 'Visible to everyone with the share link.',
  },
] as const;

export type LeadOption = { value: string; label: string };

export const leadOptions: readonly LeadOption[] = [
  { value: 'jw', label: 'Jens Wedin — Designer-engineer' },
  { value: 'al', label: 'Anna Lindqvist — Design lead' },
  { value: 'eh', label: 'Erik Holmberg — Frontend' },
  { value: 'mw', label: 'Maja Westin — Researcher' },
] as const;

export type NotificationPref = { id: string; label: string; defaultChecked: boolean };

export const notificationPrefs: readonly NotificationPref[] = [
  { id: 'pref-status', label: 'Weekly status summary', defaultChecked: true },
  { id: 'pref-mentions', label: '@mentions in comments', defaultChecked: true },
  { id: 'pref-deadlines', label: 'Approaching deadlines', defaultChecked: true },
  { id: 'pref-handoffs', label: 'Handoff requests', defaultChecked: false },
];

export type FormDefaults = {
  name: string;
  slug: string;
  tagline: string;
  category: string;
  lead: string;
  visibility: VisibilityOption['value'];
  startDate: Date | undefined;
  dueDate: Date | undefined;
};

export const happyPathDefaults: FormDefaults = {
  name: 'Manfred Design System v1.0',
  slug: 'manfred-design-system-v1',
  tagline: 'Ship the first stable release of the shared component library.',
  category: 'design',
  lead: 'jw',
  visibility: 'internal',
  startDate: new Date(2026, 4, 5), // 2026-05-05
  dueDate: new Date(2026, 6, 31), // 2026-07-31
};

export const errorMessages = {
  banner: "Couldn't create the project. Fix the highlighted fields and try again.",
  name: 'A project with this name already exists in Studio Manfred.',
  slug: 'Slugs may only contain lowercase letters, numbers and hyphens.',
  dueDate: 'Due date must be after the start date.',
} as const;
