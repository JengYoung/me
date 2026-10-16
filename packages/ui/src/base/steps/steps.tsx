'use client';
import { createContext, useContext, useEffect, useRef, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { mergeProps } from '../_shared/react/index';
import type { PartProps } from '../_shared/react/index';
import { connectStepNavigation } from './steps.connect';
import type { StepsApi, StepsContentApi, StepsNavigation } from './steps.connect';

export type StepsRootProps = PartProps<'div'>;
export type StepsItemProps<Name extends string = string> = PartProps<'li'> & { stepName: Name };
export type StepsTriggerProps<Name extends string = string> = PartProps<'button'> & { stepName: Name };
export type StepsRenderChildren<Name extends string = string> =
  | ReactNode
  | ((steps: StepsContentApi<Name>) => ReactNode);
export type StepsCompleteProps<Name extends string = string> = Omit<PartProps<'div'>, 'children'> &
  StepsNavigation & {
    children?: StepsRenderChildren<Name>;
    focusOnEntry?: boolean;
  };
export type StepsContentProps<Name extends string = string> = StepsCompleteProps<Name> & { stepName: Name };

function useEntryFocus(active: boolean, enabled: boolean) {
  const element = useRef<HTMLDivElement>(null);
  const wasActive = useRef(active);
  useEffect(() => {
    if (enabled && active && !wasActive.current) element.current?.focus();
    wasActive.current = active;
  }, [active, enabled]);
  return element;
}

/** Created once per hook instance. Only committed API snapshots cross this binding. */
export function createStepsBinding<Name extends string>(initial: StepsApi<Name>) {
  let snapshot = initial;
  const listeners = new Set<() => void>();
  const getSnapshot = () => snapshot;
  const getServerSnapshot = () => initial;
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };
  const Context = createContext<StepsApi<Name> | null>(null);
  const Navigation = createContext<StepsContentApi<Name> | null>(null);
  function useApi() {
    const api = useContext(Context);
    if (!api) throw new Error('Steps parts must be rendered inside their own Steps component.');
    return api;
  }
  function useNavigation() {
    const api = useContext(Navigation);
    if (!api) throw new Error('Steps.Next and Steps.Previous must be rendered inside Steps.Content or Steps.Complete.');
    return api;
  }
  function Steps({ children, ...props }: StepsRootProps) {
    const api = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    return (
      <Context value={api}>
        <div {...api.getRootProps(props)}>{children}</div>
      </Context>
    );
  }
  function List(props: PartProps<'ol'>) {
    return <ol {...useApi().getListProps(props)} />;
  }
  function Item({ stepName, ...props }: StepsItemProps<Name>) {
    return <li {...useApi().getItemProps(stepName, props)} />;
  }
  function Trigger({ stepName, ...props }: StepsTriggerProps<Name>) {
    return <button {...useApi().getTriggerProps(stepName, props)} />;
  }
  function Content({
    stepName,
    children,
    onNext,
    onPrevious,
    focusOnEntry = false,
    ...props
  }: StepsContentProps<Name>) {
    const api = useApi();
    const active = api.value === stepName;
    const ref = useEntryFocus(active, focusOnEntry);
    const navigation = connectStepNavigation(api, active, { onNext, onPrevious });
    return (
      <Navigation value={navigation}>
        <div {...api.getContentProps(stepName, mergeProps<'div'>(props, { ref }))}>
          {typeof children === 'function' ? children(navigation) : children}
        </div>
      </Navigation>
    );
  }
  function Complete({ children, onNext, onPrevious, focusOnEntry = false, ...props }: StepsCompleteProps<Name>) {
    const api = useApi();
    const ref = useEntryFocus(api.isComplete, focusOnEntry);
    const navigation = connectStepNavigation(api, api.isComplete, { onNext, onPrevious });
    return (
      <Navigation value={navigation}>
        <div {...api.getCompleteProps(mergeProps<'div'>(props, { ref }))}>
          {typeof children === 'function' ? children(navigation) : children}
        </div>
      </Navigation>
    );
  }
  function Next(props: PartProps<'button'>) {
    return <button {...useNavigation().getNextProps(props)} />;
  }
  function Previous(props: PartProps<'button'>) {
    return <button {...useNavigation().getPreviousProps(props)} />;
  }
  function Reset(props: PartProps<'button'>) {
    return <button {...useApi().getResetProps(props)} />;
  }
  return {
    Steps: Object.assign(Steps, { List, Item, Trigger, Content, Complete, Next, Previous, Reset }),
    publish(api: StepsApi<Name>) {
      snapshot = api;
      for (const listener of listeners) listener();
    },
  };
}
export type StepsComponent<Name extends string = string> = ReturnType<typeof createStepsBinding<Name>>['Steps'];
