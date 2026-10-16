'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useDirection, useMachine, useStableId } from '../_shared/react/index';
import { useLayerFocus } from '../_shared/focus/index';
import type { LayerFocusOptions } from '../_shared/focus/index';
import { usePosition } from '../_shared/positioning/index';
import type { Placement, PositionOptions, Rect } from '../_shared/positioning/index';
import { tourMachine, tourStepId, validateTourState } from './tour.machine';
import type { TourStateOptions, TourStatus } from './tour.machine';
import { equalRect, isTourTargetAvailable, targetRect } from './tour.dom';
import { connectTour } from './tour.connect';

const useCommitEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect;
export interface TourStep {
  id: string;
  title: string;
  description?: string;
  /** Called only after commit. A null result is retried until targetTimeout. */
  target?: (signal: AbortSignal) => HTMLElement | null | Promise<HTMLElement | null>;
  placement?: Placement;
}
export interface TourMessages {
  waiting: string;
  timeout: string;
  error: string;
}
export interface TourOptions
  extends
    TourStateOptions,
    PositionOptions,
    Pick<LayerFocusOptions, 'modal' | 'initialFocus' | 'returnFocus' | 'closeOnEscape' | 'onEscapeKeyDown'> {
  steps: readonly TourStep[];
  id?: string;
  scrollIntoView?: boolean;
  spotlightPadding?: number;
  messages?: Partial<TourMessages>;
  describedBy?: string | null;
}
export function useTour(options: TourOptions) {
  const props = {
    stepId: options.stepId,
    defaultStepId: options.defaultStepId,
    onStepChange: options.onStepChange,
    targetTimeout: options.targetTimeout,
    onTargetError: options.onTargetError,
    stepIds: options.steps.map((step) => step.id),
  };
  validateTourState(props);
  if (options.steps.some((step) => !step.title.trim())) throw new Error('Tour steps require a nonempty title.');
  if (
    options.spotlightPadding !== undefined &&
    (!Number.isFinite(options.spotlightPadding) || options.spotlightPadding < 0)
  )
    throw new Error('Tour spotlightPadding must be finite and non-negative.');
  const [controlled] = useState(options.stepId !== undefined);
  if (controlled !== (options.stepId !== undefined)) throw new Error('Tour cannot switch control modes.');
  const id = useStableId('iris-tour', options.id);
  const dir = useDirection(options.dir);
  const latest = useRef(options);
  useCommitEffect(() => {
    latest.current = options;
  });
  const service = useMachine(tourMachine, { props });
  const { send } = service;
  const stepId = tourStepId(props, service.state.context);
  const step = options.steps.find((item) => item.id === stepId);
  const open = stepId !== null;
  const revision = service.state.context.revision;
  const status: TourStatus =
    service.state.context.observed === stepId ? service.state.value : open ? 'waiting' : 'closed';
  const [trigger, setTrigger] = useState<HTMLButtonElement | null>(null);
  const [content, setContent] = useState<HTMLDivElement | null>(null);
  const [resolved, setResolved] = useState<{ id: string; revision: number; element: HTMLElement | null } | null>(null);
  const target =
    resolved?.id === stepId && resolved.revision === revision && status === 'running' ? resolved.element : null;
  const [measurement, setMeasurement] = useState<{ element: HTMLElement; revision: number; rect: Rect } | null>(null);
  const rect = target && measurement?.element === target && measurement.revision === revision ? measurement.rect : null;
  const focus = useLayerFocus({
    ...options,
    open,
    modal: options.modal ?? true,
    initialFocus: () => options.initialFocus?.() ?? content,
    returnFocus: () => options.returnFocus?.() ?? trigger,
    trigger: () => trigger,
    closeOnOutside: false,
    closeOnFocusOutside: false,
    onDismiss: () => send({ type: 'END', reason: 'closed' }),
  });
  const position = usePosition({
    ...options,
    dir,
    open: open && status === 'running' && target !== null,
    placement: step?.placement ?? options.placement,
    anchor: target,
    content,
    onAnchorHidden: () => send({ type: 'LOST', revision }),
  });
  const waiting = status === 'waiting';
  useCommitEffect(() => {
    if (!waiting || stepId === null || !content) return;
    const document = content.ownerDocument;
    const view = document.defaultView!;
    const controller = new AbortController();
    let pending = false;
    let finished = false;
    const accept = (element: HTMLElement | null) => {
      if (controller.signal.aborted || finished) return;
      pending = false;
      const current = latest.current.steps.find((item) => item.id === stepId);
      if (!current || (current.target && (!element || !isTourTargetAvailable(element, document)))) return;
      if (element && latest.current.scrollIntoView !== false)
        element.scrollIntoView?.({ block: 'center', inline: 'nearest', behavior: 'instant' });
      finished = true;
      setResolved({ id: stepId, revision, element });
      send({ type: 'FOUND', revision });
    };
    const fail = (error: unknown) => {
      if (controller.signal.aborted || finished) return;
      finished = true;
      send({ type: 'FAIL', revision, message: error instanceof Error ? error.message : String(error) });
    };
    const resolve = () => {
      if (pending || finished || controller.signal.aborted) return;
      pending = true;
      try {
        const result = latest.current.steps.find((item) => item.id === stepId)?.target?.(controller.signal) ?? null;
        if (result && 'then' in result) void Promise.resolve(result).then(accept).catch(fail);
        else accept(result);
      } catch (error) {
        fail(error);
      }
    };
    const observer = new view.MutationObserver(resolve);
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['hidden', 'class', 'style'],
    });
    const poll = view.setInterval(resolve, 100);
    resolve();
    return () => {
      controller.abort();
      observer.disconnect();
      view.clearInterval(poll);
    };
  }, [waiting, stepId, revision, content, send]);
  useCommitEffect(() => {
    if (!target) return;
    const document = target.ownerDocument;
    const view = document.defaultView!;
    let lost = false;
    const measure = () => {
      if (lost) return;
      if (!isTourTargetAvailable(target, document)) {
        lost = true;
        send({ type: 'LOST', revision });
        return;
      }
      const next = targetRect(target);
      setMeasurement((previous) =>
        previous?.element === target && previous.revision === revision && equalRect(previous.rect, next)
          ? previous
          : { element: target, revision, rect: next },
      );
      position.update();
    };
    measure();
    const observer = new view.MutationObserver(measure);
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['hidden', 'class', 'style'],
    });
    const resize = view.ResizeObserver ? new view.ResizeObserver(measure) : null;
    resize?.observe(target);
    const poll = view.setInterval(measure, 100);
    view.addEventListener('resize', measure);
    document.addEventListener('scroll', measure, true);
    view.visualViewport?.addEventListener('resize', measure);
    view.visualViewport?.addEventListener('scroll', measure);
    return () => {
      observer.disconnect();
      resize?.disconnect();
      view.clearInterval(poll);
      view.removeEventListener('resize', measure);
      document.removeEventListener('scroll', measure, true);
      view.visualViewport?.removeEventListener('resize', measure);
      view.visualViewport?.removeEventListener('scroll', measure);
    };
  }, [target, revision, send, position.update]);
  const previousStep = useRef<string | null>(null);
  useCommitEffect(() => {
    if (!open) {
      previousStep.current = null;
      return;
    }
    if (!content) return;
    const changed = previousStep.current !== null && previousStep.current !== stepId;
    previousStep.current = stepId;
    if (changed && ((options.modal ?? true) || content.contains(content.ownerDocument.activeElement)))
      content.focus({ preventScroll: true });
  }, [open, stepId, content, options.modal]);
  return connectTour(service, { ...options, id, dir }, { stepId, step, status, target, rect }, focus, position, {
    setTrigger,
    setContent,
  });
}
export type { TourApi } from './tour.connect';
