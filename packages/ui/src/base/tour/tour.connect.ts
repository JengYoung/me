import { mergeProps } from '../_shared/react/index';
import type { CSSProperties } from 'react';
import type { MachineApi, PartProps } from '../_shared/react/index';
import type { ModalFocusApi } from '../_shared/focus/index';
import type { Rect, usePosition } from '../_shared/positioning/index';
import type { TourSchema, TourStatus } from './tour.machine';
import type { TourOptions, TourStep } from './use-tour';

export function connectTour(
  service: MachineApi<TourSchema>,
  options: TourOptions & { id: string; dir: 'ltr' | 'rtl' },
  state: {
    stepId: string | null;
    step: TourStep | undefined;
    status: TourStatus;
    target: HTMLElement | null;
    rect: Rect | null;
  },
  focus: ModalFocusApi,
  position: ReturnType<typeof usePosition>,
  refs: { setTrigger: (node: HTMLButtonElement | null) => void; setContent: (node: HTMLDivElement | null) => void },
) {
  const open = state.stepId !== null;
  const stepIndex = options.steps.findIndex((step) => step.id === state.stepId);
  const isFirst = stepIndex === 0;
  const isLast = stepIndex >= 0 && stepIndex === options.steps.length - 1;
  const modal = options.modal ?? true;
  const data = (part: string) => ({
    'data-scope': 'tour',
    'data-part': part,
    'data-state': state.status,
    'data-step': state.stepId ?? undefined,
  });
  const start = (stepId?: string) => service.send({ type: 'START', stepId });
  const next = () => service.send({ type: 'NEXT' });
  const previous = () => service.send({ type: 'PREVIOUS' });
  const close = () => service.send({ type: 'END', reason: 'closed' });
  const skip = () => service.send({ type: 'END', reason: 'skipped' });
  const retry = () => service.send({ type: 'RETRY' });
  const centered: CSSProperties = {
    position: 'fixed',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: 'calc(100vw - 32px)',
    maxHeight: 'calc(100dvh - 32px)',
  };
  const contentStyle = state.target && state.status === 'running' ? position.style : centered;
  const padding = options.spotlightPadding ?? 4;
  const spotlightStyle: CSSProperties = {
    position: 'fixed',
    pointerEvents: 'none',
    left: (state.rect?.x ?? 0) - padding,
    top: (state.rect?.y ?? 0) - padding,
    width: (state.rect?.width ?? 0) + padding * 2,
    height: (state.rect?.height ?? 0) + padding * 2,
  };
  const message =
    state.status === 'waiting'
      ? (options.messages?.waiting ?? 'Waiting for target…')
      : state.status === 'timed-out'
        ? (options.messages?.timeout ?? 'The target could not be found. Retry or continue.')
        : state.status === 'error'
          ? (options.messages?.error ?? 'The target could not be loaded. Retry or continue.')
          : '';
  function action(part: string, run: () => void, disabled: boolean, props: PartProps<'button'>): PartProps<'button'> {
    return mergeProps<'button'>(props, {
      ...data(part),
      type: 'button',
      disabled: disabled || props.disabled,
      onClick: () => {
        if (!disabled && !props.disabled) run();
      },
    });
  }
  return {
    open,
    stepId: state.stepId,
    step: state.step,
    stepIndex,
    count: options.steps.length,
    status: state.status,
    isFirst,
    isLast,
    target: state.target,
    targetRect: state.rect,
    scope: focus.scope,
    placement: position.placement,
    start,
    next,
    previous,
    skip,
    close,
    retry,
    goTo: (stepId: string) => service.send({ type: 'GO', stepId }),
    updatePosition: position.update,
    getTriggerProps(props: PartProps<'button'> = {}): PartProps<'button'> {
      return mergeProps<'button'>(
        action('trigger', () => start(), options.steps.length === 0, props),
        {
          ref: refs.setTrigger,
          id: `${options.id}-trigger`,
          'aria-haspopup': 'dialog',
          'aria-expanded': open,
          'aria-controls': `${options.id}-content`,
        },
      );
    },
    getContentProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      const { 'aria-modal': _modal, 'aria-describedby': describedBy, ...user } = props;
      return focus.getContentProps(
        mergeProps<'div'>(user, {
          ...data('content'),
          ref: refs.setContent,
          id: `${options.id}-content`,
          role: 'dialog',
          'aria-modal': modal || undefined,
          'aria-labelledby': props['aria-labelledby'] ?? (props['aria-label'] ? undefined : `${options.id}-title`),
          'aria-describedby':
            options.describedBy === null
              ? undefined
              : (options.describedBy ??
                describedBy ??
                (state.step?.description ? `${options.id}-description` : undefined)),
          hidden: !open,
          dir: options.dir,
          style: contentStyle,
          'data-placement': state.target ? position.placement : 'center',
        }),
      );
    },
    getTitleProps: (props: PartProps<'h2'> = {}) =>
      mergeProps<'h2'>(props, {
        ...data('title'),
        id: `${options.id}-title`,
        children: props.children ?? state.step?.title,
      }),
    getDescriptionProps: (props: PartProps<'p'> = {}) =>
      mergeProps<'p'>(props, {
        ...data('description'),
        id: `${options.id}-description`,
        children: props.children ?? state.step?.description,
      }),
    getStatusProps: (props: PartProps<'p'> = {}) =>
      mergeProps<'p'>(props, {
        ...data('status'),
        role: 'status',
        'aria-live': 'polite',
        'aria-atomic': true,
        children: props.children ?? message,
      }),
    getProgressProps: (props: PartProps<'p'> = {}) =>
      mergeProps<'p'>(props, {
        ...data('progress'),
        'aria-live': 'polite',
        'aria-atomic': true,
        children: props.children ?? `${stepIndex + 1} / ${options.steps.length}`,
      }),
    getNextProps: (props: PartProps<'button'> = {}) =>
      action('next', next, !open, { ...props, children: props.children ?? (isLast ? 'Finish' : 'Next') }),
    getPreviousProps: (props: PartProps<'button'> = {}) => action('previous', previous, !open || stepIndex <= 0, props),
    getSkipProps: (props: PartProps<'button'> = {}) => action('skip', skip, !open, props),
    getCloseProps: (props: PartProps<'button'> = {}) => action('close', close, !open, props),
    getRetryProps: (props: PartProps<'button'> = {}) =>
      action('retry', retry, !open || (state.status !== 'timed-out' && state.status !== 'error'), props),
    getSpotlightProps: (props: PartProps<'div'> = {}) =>
      mergeProps<'div'>(props, {
        ...data('spotlight'),
        hidden: !open || !state.rect || state.status !== 'running',
        'aria-hidden': true,
        style: spotlightStyle,
      }),
    getBackdropProps: (props: PartProps<'div'> = {}) =>
      mergeProps<'div'>(props, {
        ...data('backdrop'),
        hidden: !open || !modal,
        'aria-hidden': true,
        style: { position: 'fixed', inset: 0, pointerEvents: 'none' },
      }),
  };
}
export type TourApi = ReturnType<typeof connectTour>;
