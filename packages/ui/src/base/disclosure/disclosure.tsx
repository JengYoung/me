'use client';

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from "../_shared/react/index";
import { useDisclosure } from "./use-disclosure";
import type { DisclosureApi, DisclosureOptions } from "./use-disclosure";

const DisclosureContext = createContext<DisclosureApi | null>(null);

function useDisclosureContext(): DisclosureApi {
  const api = useContext(DisclosureContext);
  if (!api) throw new Error('Disclosure parts must be rendered inside Disclosure.Root.');
  return api;
}

export function DisclosureRoot({ children, ...options }: DisclosureOptions & { children?: ReactNode }) {
  return <DisclosureContext value={useDisclosure(options)}>{children}</DisclosureContext>;
}

export function DisclosureTrigger(props: PartProps<'button'>) {
  return <button {...useDisclosureContext().getTriggerProps(props)} />;
}

export function DisclosureContent(props: PartProps<'div'>) {
  return <div {...useDisclosureContext().getContentProps(props)} />;
}

export const Disclosure = { Root: DisclosureRoot, Trigger: DisclosureTrigger, Content: DisclosureContent };
