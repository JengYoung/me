'use client';

import { useMachine, useFormReset, mergeRefs } from '../_shared/react/index';
import type { FieldOptions } from '../field/index';
import { useTextField } from '../text-field/index';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { editableMachine, editableEditing, editableDraft, editableValue } from './editable.machine';
import type { EditableBehaviorOptions } from './editable.machine';
import { connectEditable } from './editable.connect';

export interface EditableOptions extends EditableBehaviorOptions, Omit<FieldOptions, 'label'> {
  name?: string;
  form?: string;
  submitOnBlur?: boolean;
  submitOnEnter?: boolean;
  selectOnFocus?: boolean;
}
export function useEditable(options: EditableOptions = {}) {
  const [controlled] = useState(() => ({ value: options.value !== undefined, editing: options.editing !== undefined }));
  if (controlled.value !== (options.value !== undefined) || controlled.editing !== (options.editing !== undefined))
    throw new Error('Editable cannot switch value or editing control modes.');
  const { state, send, getSnapshot, getProps } = useMachine(editableMachine, { props: options });
  const editing = editableEditing(options, state.value);
  const value = editableValue(options, state.context);
  const draft = editableDraft(options, state.context);
  const invalid = !!options.invalid || state.context.invalid;
  const inputChanged = useCallback((text: string) => send({ type: 'INPUT', value: text }), [send]);
  const text = useTextField({
    ...options,
    value: draft,
    defaultValue: undefined,
    invalid,
    onValueChange: inputChanged,
  });
  const root = useRef<HTMLDivElement | null>(null);
  const input = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const preview = useRef<HTMLSpanElement | null>(null);
  const restoreFocus = useRef(false);
  const previousEditing = useRef(false);
  const inputRef = useCallback((node: HTMLInputElement | HTMLTextAreaElement | null) => {
    input.current = node;
    return () => {
      if (input.current === node) input.current = null;
    };
  }, []);
  const reset = useCallback(() => {
    restoreFocus.current = false;
    send({ type: 'RESET' });
  }, [send]);
  const resetRef = useFormReset(options.form, reset);
  // mergeRefs only creates a callback; ref reads/writes occur during React commit.
  // oxlint-disable-next-line react/refs
  const ref = useMemo(() => mergeRefs(inputRef, resetRef), [inputRef, resetRef]);
  const edit = useCallback(() => send({ type: 'EDIT' }), [send]);
  const commit = useCallback(() => {
    const active = root.current?.ownerDocument.activeElement;
    restoreFocus.current = !!active && !!root.current?.contains(active);
    send({ type: 'COMMIT' });
  }, [send]);
  const cancel = useCallback(() => {
    const active = root.current?.ownerDocument.activeElement;
    restoreFocus.current = !!active && !!root.current?.contains(active);
    send({ type: 'CANCEL' });
  }, [send]);
  const blur = useCallback(() => {
    restoreFocus.current = false;
    send({ type: 'COMMIT' });
  }, [send]);
  useLayoutEffect(() => {
    if (editing && !previousEditing.current && !options.disabled) {
      input.current?.focus();
      if (options.selectOnFocus !== false) input.current?.select();
    } else if (!editing && previousEditing.current && restoreFocus.current) {
      const target = [trigger.current, preview.current, root.current].find(
        (node) => node?.isConnected && !node.hidden && !('disabled' in node && node.disabled),
      );
      target?.focus();
    }
    previousEditing.current = editing;
    // Rejected controlled requests must not restore focus on a later unrelated update.
    restoreFocus.current = false;
  });
  const composing = () => getSnapshot().context.composing || getSnapshot().status !== 'active';
  // connect stores refs and DOM commands without invoking them during render.
  /* oxlint-disable react/refs */
  return connectEditable(
    text,
    { ...options, editing, value, draft, invalid },
    {
      root,
      trigger,
      preview,
      ref,
      edit,
      commit,
      cancel,
      blur,
      composing,
      composition: (active) => send({ type: 'COMPOSITION', active }),
      submitOnBlur: () => getProps().disabled !== true && getProps().readOnly !== true,
    },
  );
  /* oxlint-enable react/refs */
}
export type { EditableApi } from './editable.connect';
