import { mergeProps } from "../_shared/react/index";
import type { MachineApi, PartProps } from "../_shared/react/index";
import { isStepEnabled, stepsValue, stepsVisited } from "./steps.machine";
import type { StepsMachineProps, StepsSchema, StepsValue } from "./steps.machine";

export function connectSteps<Name extends string>(
  service: MachineApi<StepsSchema>,
  options: StepsMachineProps & { id: string },
  commands: { go: (stepName: StepsValue<Name>) => void; reset: () => void },
) {
  const value = stepsValue(options, service.state.context) as StepsValue<Name>;
  const visited: readonly Name[] = stepsVisited(options, service.state.context) as Name[];
  const count = Object.keys(options.labels).length;
  const isComplete = Object.keys(options.labels).some((name) => isStepEnabled(options, name)) && value === null;
  const contentId = (name: Name) => `${options.id}-content-${encodeURIComponent(name)}`;
  const getStepState = (name: Name) => {
    return {
      current: value === name,
      visited: visited.includes(name),
      disabled: !!options.disabled || !isStepEnabled(options, name),
    };
  };
  const data = (name: Name) => {
    const state = getStepState(name);
    return {
      'data-current': state.current,
      'data-visited': state.visited,
      'data-disabled': state.disabled,
      'data-value': name,
    };
  };
  return {
    ...commands,
    value,
    visited,
    count,
    isComplete,
    disabled: !!options.disabled,
    getStepState,
    getRootProps(user: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(user, {
        id: options.id,
        role: 'group',
        'data-scope': 'steps',
        'data-part': 'root',
        'data-complete': isComplete,
      });
    },
    getListProps(user: PartProps<'ol'> = {}): PartProps<'ol'> {
      return mergeProps<'ol'>(user, { 'data-scope': 'steps', 'data-part': 'list' });
    },
    getItemProps(name: Name, user: PartProps<'li'> = {}): PartProps<'li'> {
      return mergeProps<'li'>(user, { 'data-scope': 'steps', 'data-part': 'item', ...data(name) });
    },
    getTriggerProps(name: Name, user: PartProps<'button'> = {}): PartProps<'button'> {
      const state = getStepState(name);
      const { 'aria-current': _current, ...props } = user;
      return mergeProps<'button'>(props, {
        id: `${options.id}-trigger-${encodeURIComponent(name)}`,
        type: 'button',
        disabled: state.disabled || !!user.disabled,
        'aria-current': state.current ? 'step' : undefined,
        'aria-controls': contentId(name),
        'data-scope': 'steps',
        'data-part': 'trigger',
        ...data(name),
        onClick: () => commands.go(name),
      });
    },
    getContentProps(name: Name, user: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(user, {
        id: contentId(name),
        role: 'region',
        'aria-label': user['aria-label'] ?? (user['aria-labelledby'] ? undefined : options.labels[name]),
        hidden: value !== name,
        tabIndex: user.tabIndex ?? -1,
        'data-scope': 'steps',
        'data-part': 'content',
        ...data(name),
      });
    },
    getCompleteProps(user: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(user, {
        id: `${options.id}-complete`,
        role: 'region',
        'aria-label': user['aria-label'] ?? (user['aria-labelledby'] ? undefined : 'Complete'),
        hidden: !isComplete,
        tabIndex: user.tabIndex ?? -1,
        'data-scope': 'steps',
        'data-part': 'complete',
      });
    },
    getResetProps(user: PartProps<'button'> = {}): PartProps<'button'> {
      return mergeProps<'button'>(user, {
        type: 'button',
        disabled: !!options.disabled || !!user.disabled,
        'data-scope': 'steps',
        'data-part': 'reset',
        onClick: commands.reset,
      });
    },
  };
}
export type StepsApi<Name extends string = string> = ReturnType<typeof connectSteps<Name>>;
export interface StepsNavigation {
  onNext?: () => void;
  onPrevious?: () => void;
}
export function connectStepNavigation<Name extends string>(
  api: StepsApi<Name>,
  active: boolean,
  navigation: StepsNavigation,
) {
  const canNext = active && !api.disabled && !!navigation.onNext;
  const canPrevious = active && !api.disabled && !!navigation.onPrevious;
  const next = () => {
    if (canNext) navigation.onNext?.();
  };
  const previous = () => {
    if (canPrevious) navigation.onPrevious?.();
  };
  return {
    ...api,
    canNext,
    canPrevious,
    next,
    previous,
    getNextProps(user: PartProps<'button'> = {}): PartProps<'button'> {
      return mergeProps<'button'>(user, {
        type: 'button',
        disabled: !canNext || !!user.disabled,
        'data-scope': 'steps',
        'data-part': 'next',
        onClick: next,
      });
    },
    getPreviousProps(user: PartProps<'button'> = {}): PartProps<'button'> {
      return mergeProps<'button'>(user, {
        type: 'button',
        disabled: !canPrevious || !!user.disabled,
        'data-scope': 'steps',
        'data-part': 'previous',
        onClick: previous,
      });
    },
  };
}
export type StepsContentApi<Name extends string = string> = ReturnType<typeof connectStepNavigation<Name>>;
