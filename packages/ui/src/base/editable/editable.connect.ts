import { mergeProps } from '../_shared/react/index';
import type { PartProps } from '../_shared/react/index';
import type { TextFieldApi, TextFieldInputProps, TextFieldTextareaProps } from '../text-field/index';
import type { KeyboardEvent, RefCallback, RefObject } from 'react';
import type { EditableOptions } from './use-editable';

export function connectEditable(
  text: TextFieldApi,
  options: EditableOptions & { editing: boolean; value: string; draft: string; invalid: boolean },
  actions: {
    root: RefObject<HTMLDivElement | null>;
    trigger: RefObject<HTMLButtonElement | null>;
    preview: RefObject<HTMLSpanElement | null>;
    ref: RefCallback<HTMLInputElement | HTMLTextAreaElement>;
    edit(): void;
    commit(): void;
    cancel(): void;
    blur(): void;
    composing(): boolean;
    composition(active: boolean): void;
    submitOnBlur(): boolean;
  },
) {
  const data = (part: string) => ({
    'data-scope': 'editable',
    'data-part': part,
    'data-state': options.editing ? 'editing' : 'idle',
    'data-invalid': options.invalid ? '' : undefined,
  });
  function keyDown(event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, multiline: boolean) {
    if (event.nativeEvent.isComposing || event.keyCode === 229 || actions.composing()) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      actions.cancel();
    } else if (
      event.key === 'Enter' &&
      options.submitOnEnter !== false &&
      (!multiline || event.ctrlKey || event.metaKey)
    ) {
      event.preventDefault();
      actions.commit();
    }
  }
  return {
    ids: text.ids,
    editing: options.editing,
    value: options.value,
    draft: options.draft,
    invalid: options.invalid,
    edit: actions.edit,
    commit: actions.commit,
    cancel: actions.cancel,
    getRootProps(user: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(text.getRootProps(user), {
        ...data('root'),
        ref: actions.root,
        tabIndex: -1,
        onBlur(event) {
          const next = event.relatedTarget;
          if (next && event.currentTarget.contains(next)) return;
          if (options.editing && options.submitOnBlur !== false && actions.submitOnBlur()) actions.blur();
        },
      });
    },
    getLabelProps(user: PartProps<'label'> = {}) {
      return mergeProps<'label'>(text.getLabelProps(user), data('label'));
    },
    getDescriptionProps(user: PartProps<'span'> = {}) {
      return mergeProps<'span'>(text.getDescriptionProps(user), data('description'));
    },
    getErrorProps(user: PartProps<'span'> = {}) {
      return mergeProps<'span'>(text.getErrorProps(user), data('error'));
    },
    getPreviewProps(user: PartProps<'span'> = {}): PartProps<'span'> {
      return mergeProps<'span'>(user, {
        ...data('preview'),
        ref: actions.preview,
        tabIndex: -1,
        hidden: options.editing,
      });
    },
    getInputProps(user: TextFieldInputProps = {}): PartProps<'input'> {
      return mergeProps<'input'>(text.getInputProps(user), {
        ...data('input'),
        ref: actions.ref,
        hidden: !options.editing,
        readOnly: !options.editing || !!options.readOnly,
        onKeyDown(event) {
          keyDown(event, false);
        },
        onCompositionStart() {
          actions.composition(true);
        },
        onCompositionEnd() {
          actions.composition(false);
        },
      });
    },
    getTextareaProps(user: TextFieldTextareaProps = {}): PartProps<'textarea'> {
      return mergeProps<'textarea'>(text.getTextareaProps(user), {
        ...data('textarea'),
        ref: actions.ref,
        hidden: !options.editing,
        readOnly: !options.editing || !!options.readOnly,
        onKeyDown(event) {
          keyDown(event, true);
        },
        onCompositionStart() {
          actions.composition(true);
        },
        onCompositionEnd() {
          actions.composition(false);
        },
      });
    },
    getEditTriggerProps(user: PartProps<'button'> = {}): PartProps<'button'> {
      return mergeProps<'button'>(user, {
        ...data('edit-trigger'),
        ref: actions.trigger,
        type: 'button',
        hidden: options.editing,
        disabled: !!options.disabled || !!options.readOnly,
        'aria-controls': text.ids.control,
        onClick: actions.edit,
      });
    },
    getSubmitTriggerProps(user: PartProps<'button'> = {}): PartProps<'button'> {
      return mergeProps<'button'>(user, {
        ...data('submit-trigger'),
        type: 'button',
        hidden: !options.editing,
        disabled: !!options.disabled || !!options.readOnly,
        onClick: actions.commit,
      });
    },
    getCancelTriggerProps(user: PartProps<'button'> = {}): PartProps<'button'> {
      return mergeProps<'button'>(user, {
        ...data('cancel-trigger'),
        type: 'button',
        hidden: !options.editing,
        disabled: !!options.disabled,
        onClick: actions.cancel,
      });
    },
  };
}
export type EditableApi = ReturnType<typeof connectEditable>;
