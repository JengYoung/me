'use client';
import { createContext, useContext } from 'react';
import type { PartProps } from "../_shared/react/index";
import { useClipboard } from "./use-clipboard";
import type { ClipboardApi, ClipboardOptions } from "./use-clipboard";
const Context = createContext<ClipboardApi | null>(null);
function useClipboardContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Clipboard parts must be rendered inside Clipboard.Root.');
  return api;
}
export type ClipboardRootProps = ClipboardOptions & Omit<PartProps<'div'>, 'onError'>;
export function ClipboardRoot({
  value,
  disabled,
  feedbackDuration,
  onSuccess,
  onError,
  messages,
  ...props
}: ClipboardRootProps) {
  const api = useClipboard({ value, disabled, feedbackDuration, onSuccess, onError, messages });
  return (
    <Context value={api}>
      <div {...api.getRootProps(props)} />
    </Context>
  );
}
export function ClipboardTrigger(props: PartProps<'button'>) {
  return <button {...useClipboardContext().getTriggerProps(props)} />;
}
export function ClipboardFeedback(props: PartProps<'span'>) {
  return <span {...useClipboardContext().getFeedbackProps(props)} />;
}
export const Clipboard = { Root: ClipboardRoot, Trigger: ClipboardTrigger, Feedback: ClipboardFeedback };
