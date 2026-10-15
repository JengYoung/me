'use client';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { useMachine, useStableId } from "../_shared/react/index";
import { stepsMachine, validateSteps } from "./steps.machine";
import type { StepsLabels, StepsMachineProps, StepsOptions, StepsValue } from "./steps.machine";
import { connectSteps } from "./steps.connect";
import { createStepsBinding } from "./steps";

const useBindingEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect;

export function useSteps<Name extends string>(labels: StepsLabels<Name>, options: StepsOptions<NoInfer<Name>> = {}) {
  validateSteps(labels);
  const [controlled] = useState(options.value !== undefined);
  if (controlled !== (options.value !== undefined)) throw new Error('Steps cannot switch control modes.');
  const id = useStableId('iris-steps', options.id);
  // Public keys stay narrow; the framework-independent actor accepts validated string events.
  const props = { ...options, labels } as StepsMachineProps;
  const service = useMachine(stepsMachine, { props });
  const { send } = service;
  const go = useCallback((stepName: StepsValue<Name>) => send({ type: 'GO', value: stepName }), [send]);
  const reset = useCallback(() => send({ type: 'RESET' }), [send]);
  const api = connectSteps(service, { ...props, id }, { go, reset });
  // A state initializer preserves all bound component types across parent renders.
  const [binding] = useState(() => createStepsBinding(api));
  useBindingEffect(() => binding.publish(api), [binding, api]);
  return { ...api, Steps: binding.Steps };
}
export type { StepsLabels, StepsOptions, StepsValue, StepsChangeDetails } from "./steps.machine";
export type StepsApi<Name extends string = string> = ReturnType<typeof useSteps<Name>>;
export type { StepsContentApi, StepsNavigation } from "./steps.connect";
