'use client';
import { createContext, useContext } from 'react';
import type { PartProps } from "../_shared/react/index";
import { useAccordion } from "./use-accordion";
import type { AccordionApi, AccordionOptions } from "./use-accordion";

const Context = createContext<AccordionApi | null>(null);
function useAccordionContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Accordion parts must be rendered inside Accordion.Root.');
  return api;
}
export type AccordionRootProps = Omit<PartProps<'div'>, keyof AccordionOptions | 'defaultValue'> & AccordionOptions;
export function AccordionRoot({
  items,
  value,
  defaultValue,
  onValueChange,
  multiple,
  collapsible,
  disabled,
  loop,
  dir,
  id,
  ...props
}: AccordionRootProps) {
  const api = useAccordion({
    items,
    value,
    defaultValue,
    onValueChange,
    multiple,
    collapsible,
    disabled,
    loop,
    dir,
    id,
  });
  return (
    <Context value={api}>
      <div {...api.getRootProps(props)} />
    </Context>
  );
}
export type AccordionHeadingProps = PartProps<'h3'> & { value: string; as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6' };
export function AccordionHeading({ value, as: Tag = 'h3', ...props }: AccordionHeadingProps) {
  return <Tag {...useAccordionContext().getHeadingProps(value, props)} />;
}
export function AccordionTrigger({ value, ...props }: Omit<PartProps<'button'>, 'value'> & { value: string }) {
  return <button {...useAccordionContext().getTriggerProps(value, props)} />;
}
export function AccordionContent({ value, ...props }: PartProps<'div'> & { value: string }) {
  return <div {...useAccordionContext().getContentProps(value, props)} />;
}
export const Accordion = {
  Root: AccordionRoot,
  Heading: AccordionHeading,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
};
