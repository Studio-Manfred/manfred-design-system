import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './Accordion';

function SingleCollapsible({ defaultValue }: { defaultValue?: string }) {
  return (
    <Accordion type="single" collapsible defaultValue={defaultValue}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Question one</AccordionTrigger>
        <AccordionContent>Answer one</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Question two</AccordionTrigger>
        <AccordionContent>Answer two</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function SingleNonCollapsible() {
  return (
    <Accordion type="single" defaultValue="item-1">
      <AccordionItem value="item-1">
        <AccordionTrigger>Question one</AccordionTrigger>
        <AccordionContent>Answer one</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Question two</AccordionTrigger>
        <AccordionContent>Answer two</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function MultipleAccordion() {
  return (
    <Accordion type="multiple">
      <AccordionItem value="item-1">
        <AccordionTrigger>Question one</AccordionTrigger>
        <AccordionContent>Answer one</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Question two</AccordionTrigger>
        <AccordionContent>Answer two</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

describe('Accordion', () => {
  it('renders all triggers as buttons', () => {
    render(<SingleCollapsible />);
    expect(
      screen.getByRole('button', { name: 'Question one' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Question two' }),
    ).toBeInTheDocument();
  });

  it('starts with all items collapsed when no defaultValue is given', () => {
    render(<SingleCollapsible />);
    const trigger = screen.getByRole('button', { name: 'Question one' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Answer one')).toBeNull();
  });

  it('expands an item when its trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<SingleCollapsible />);
    const trigger = screen.getByRole('button', { name: 'Question one' });
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Answer one')).toBeVisible();
  });

  it('collapses an item when its trigger is clicked again (collapsible)', async () => {
    const user = userEvent.setup();
    render(<SingleCollapsible defaultValue="item-1" />);
    const trigger = screen.getByRole('button', { name: 'Question one' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('single non-collapsible: opening item 2 closes item 1', async () => {
    const user = userEvent.setup();
    render(<SingleNonCollapsible />);
    const t1 = screen.getByRole('button', { name: 'Question one' });
    const t2 = screen.getByRole('button', { name: 'Question two' });
    expect(t1).toHaveAttribute('aria-expanded', 'true');
    await user.click(t2);
    expect(t1).toHaveAttribute('aria-expanded', 'false');
    expect(t2).toHaveAttribute('aria-expanded', 'true');
  });

  it('multiple mode: opening item 2 leaves item 1 open', async () => {
    const user = userEvent.setup();
    render(<MultipleAccordion />);
    const t1 = screen.getByRole('button', { name: 'Question one' });
    const t2 = screen.getByRole('button', { name: 'Question two' });
    await user.click(t1);
    await user.click(t2);
    expect(t1).toHaveAttribute('aria-expanded', 'true');
    expect(t2).toHaveAttribute('aria-expanded', 'true');
  });

  it('keyboard: Enter on trigger toggles the item', async () => {
    const user = userEvent.setup();
    render(<SingleCollapsible />);
    const trigger = screen.getByRole('button', { name: 'Question one' });
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('keyboard: Space on trigger toggles the item', async () => {
    const user = userEvent.setup();
    render(<SingleCollapsible />);
    const trigger = screen.getByRole('button', { name: 'Question one' });
    trigger.focus();
    await user.keyboard(' ');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('content is hidden when item is collapsed', () => {
    render(<SingleCollapsible defaultValue="item-1" />);
    const t1 = screen.getByRole('button', { name: 'Question one' });
    const t2 = screen.getByRole('button', { name: 'Question two' });
    expect(t1).toHaveAttribute('aria-expanded', 'true');
    expect(t2).toHaveAttribute('aria-expanded', 'false');
    // Item 1 content is in the DOM and visible
    expect(screen.getByText('Answer one')).toBeVisible();
    // Item 2 content is hidden (Radix removes it from accessibility tree)
    expect(screen.queryByText('Answer two')).toBeNull();
  });

  it('forwards className on AccordionItem', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="x" className="custom-item" data-testid="item">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Body</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByTestId('item')).toHaveClass('custom-item');
  });

  it('forwards className on AccordionTrigger', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="x">
          <AccordionTrigger className="custom-trigger">Trigger</AccordionTrigger>
          <AccordionContent>Body</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByRole('button', { name: 'Trigger' })).toHaveClass(
      'custom-trigger',
    );
  });

  it('forwards className on AccordionContent (inner wrapper)', async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="x">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent className="custom-content">
            <span data-testid="body">Body</span>
          </AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    await user.click(screen.getByRole('button', { name: 'Trigger' }));
    // The className lands on the inner padding wrapper around children.
    const body = screen.getByTestId('body');
    expect(body.parentElement).toHaveClass('custom-content');
  });

  it('forwards refs on each sub-part', () => {
    const itemRef = React.createRef<HTMLDivElement>();
    const triggerRef = React.createRef<HTMLButtonElement>();
    const contentRef = React.createRef<HTMLDivElement>();
    render(
      <Accordion type="single" collapsible defaultValue="x">
        <AccordionItem ref={itemRef} value="x">
          <AccordionTrigger ref={triggerRef}>Trigger</AccordionTrigger>
          <AccordionContent ref={contentRef}>Body</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(itemRef.current).toBeInstanceOf(HTMLElement);
    expect(triggerRef.current).toBeInstanceOf(HTMLButtonElement);
    expect(contentRef.current).toBeInstanceOf(HTMLElement);
  });
});
