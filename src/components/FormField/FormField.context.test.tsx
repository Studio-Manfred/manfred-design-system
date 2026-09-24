import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField } from './FormField';
import { TextInput } from '../TextInput';
import { Textarea } from '../Textarea';
import { Checkbox } from '../Checkbox';
import { Switch } from '../Switch';
import { RadioGroup, RadioGroupItem } from '../Radio';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../Select';
import { DatePicker } from '../DatePicker';

// STU-888: FormField wires its label + message into the wrapped DS control
// through context, so consumers pass no ids. Explicit props always win.

describe('FormField context wiring (STU-888)', () => {
  describe('native-style controls', () => {
    it('TextInput gets the label as its name and the message as its description, with no ids passed', () => {
      render(
        <FormField label="Email" status="hint" message="We never share it">
          <TextInput />
        </FormField>,
      );
      const input = screen.getByRole('textbox', { name: 'Email' });
      expect(input).toHaveAccessibleDescription('We never share it');
      expect(input).not.toHaveAttribute('aria-invalid');
    });

    it('keeps working with the existing htmlFor + id pattern', () => {
      render(
        <FormField label="Email" htmlFor="email" message="Hint">
          <TextInput id="email" />
        </FormField>,
      );
      const input = screen.getByRole('textbox', { name: 'Email' });
      expect(input).toHaveAttribute('id', 'email');
      expect(input).toHaveAccessibleDescription('Hint');
    });

    it('status="error" makes the control invalid (aria-invalid) and describes it by the error', () => {
      render(
        <FormField label="Email" status="error" message="Invalid email">
          <TextInput />
        </FormField>,
      );
      const input = screen.getByRole('textbox', { name: 'Email' });
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAccessibleDescription('Invalid email');
    });

    it('the control’s own status wins over the field’s', () => {
      render(
        <FormField label="Email" status="error" message="Invalid">
          <TextInput status="default" />
        </FormField>,
      );
      expect(screen.getByRole('textbox', { name: 'Email' })).not.toHaveAttribute('aria-invalid');
    });

    it('merges a consumer aria-describedby with the message instead of clobbering it', () => {
      render(
        <>
          <p id="extra">Extra help</p>
          <FormField label="Email" message="Hint">
            <TextInput aria-describedby="extra" />
          </FormField>
        </>,
      );
      expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAccessibleDescription(
        'Extra help Hint',
      );
    });

    it('sets no aria-describedby when there is no message', () => {
      render(
        <FormField label="Email">
          <TextInput />
        </FormField>,
      );
      expect(screen.getByRole('textbox', { name: 'Email' })).not.toHaveAttribute('aria-describedby');
    });

    it('Textarea is wired the same way', () => {
      render(
        <FormField label="Bio" status="error" message="Required">
          <Textarea />
        </FormField>,
      );
      const ta = screen.getByRole('textbox', { name: 'Bio' });
      expect(ta).toHaveAttribute('aria-invalid', 'true');
      expect(ta).toHaveAccessibleDescription('Required');
    });

    it('Checkbox is labelled by the field and gets error styling state from it', () => {
      render(
        <FormField label="Terms" status="error" message="You must accept">
          <Checkbox />
        </FormField>,
      );
      const cb = screen.getByRole('checkbox', { name: 'Terms' });
      expect(cb).toHaveAttribute('aria-invalid', 'true');
      expect(cb).toHaveAccessibleDescription('You must accept');
    });

    it('Checkbox error={false} opts out of the field’s invalid state', () => {
      render(
        <FormField label="Terms" status="error" message="x">
          <Checkbox error={false} />
        </FormField>,
      );
      expect(screen.getByRole('checkbox', { name: 'Terms' })).not.toHaveAttribute('aria-invalid');
    });

    it('Switch is wired the same way', () => {
      render(
        <FormField label="Notifications" status="error" message="Needed">
          <Switch />
        </FormField>,
      );
      const sw = screen.getByRole('switch', { name: 'Notifications' });
      expect(sw).toHaveAttribute('aria-invalid', 'true');
      expect(sw).toHaveAccessibleDescription('Needed');
    });

    it('SelectTrigger is labelled, described and invalidated by the field', () => {
      render(
        <FormField label="Country" status="error" message="Pick a country">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Choose" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="se">Sweden</SelectItem>
            </SelectContent>
          </Select>
        </FormField>,
      );
      const trigger = screen.getByRole('combobox', { name: /Country/ });
      expect(trigger).toHaveAttribute('aria-invalid', 'true');
      expect(trigger).toHaveAccessibleDescription('Pick a country');
    });

    it('DatePicker is named by the field label (plus its current value) and described by the message', () => {
      render(
        <FormField label="Check-in" status="error" message="Pick a date">
          <DatePicker />
        </FormField>,
      );
      const trigger = screen.getByRole('combobox', { name: /^Check-in\b/ });
      expect(trigger).toHaveAttribute('aria-invalid', 'true');
      expect(trigger).toHaveAccessibleDescription('Pick a date');
    });
  });

  describe('group controls', () => {
    const group = (fieldProps = {}, groupProps = {}) =>
      render(
        <FormField label="Plan" {...fieldProps}>
          <RadioGroup {...groupProps}>
            <RadioGroupItem id="basic" value="basic" label="Basic" />
            <RadioGroupItem id="pro" value="pro" label="Pro" />
          </RadioGroup>
        </FormField>,
      );

    it('RadioGroup gets the field label as its accessible name and the message as its description', () => {
      group({ status: 'error', message: 'Pick one' });
      const rg = screen.getByRole('radiogroup', { name: 'Plan' });
      expect(rg).toHaveAccessibleDescription('Pick one');
      expect(rg).toHaveAttribute('aria-invalid', 'true');
      // …and the group error flows on to the items (STU-880 behaviour).
      for (const r of screen.getAllByRole('radio')) expect(r).toHaveAttribute('aria-invalid', 'true');
    });

    it('renders the label as a plain element (not a dangling <label for>) when wrapping a group', () => {
      group();
      const text = screen.getByText('Plan');
      expect(text.closest('label')).toBeNull();
      expect(text.closest('[id]')).not.toBeNull();
    });

    it('items keep their own ids and labels', () => {
      group();
      expect(screen.getByRole('radio', { name: 'Basic' })).toHaveAttribute('id', 'basic');
    });

    it('an explicit aria-labelledby on the group wins', () => {
      render(
        <>
          <h3 id="custom">Custom heading</h3>
          <FormField label="Plan">
            <RadioGroup aria-labelledby="custom">
              <RadioGroupItem id="a" value="a" label="A" />
            </RadioGroup>
          </FormField>
        </>,
      );
      expect(screen.getByRole('radiogroup', { name: 'Custom heading' })).toBeInTheDocument();
    });

    it('group error={false} opts out of the field’s invalid state', () => {
      group({ status: 'error', message: 'x' }, { error: false });
      expect(screen.getByRole('radiogroup', { name: 'Plan' })).not.toHaveAttribute('aria-invalid');
    });
  });

  it('controls outside a FormField are unchanged', () => {
    render(<TextInput aria-label="Standalone" />);
    const input = screen.getByRole('textbox', { name: 'Standalone' });
    expect(input).not.toHaveAttribute('id');
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(input).not.toHaveAttribute('aria-invalid');
  });
});
