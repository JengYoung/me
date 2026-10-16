import { mergeProps } from '../_shared/react/index';
import type { MachineApi, PartProps } from '../_shared/react/index';
import type { TextFieldApi, TextFieldInputProps } from '../text-field/index';
import type { KeyboardEvent, RefCallback, RefObject } from 'react';
import { splitTags, tagsInput, tagsValue } from './tags-input.machine';
import type { TagsInputSchema } from './tags-input.machine';
import type { TagsInputOptions } from './use-tags-input';

export function connectTagsInput(
  text: TextFieldApi,
  service: MachineApi<TagsInputSchema>,
  options: TagsInputOptions,
  actions: {
    ref: RefCallback<HTMLInputElement>;
    root: RefObject<HTMLDivElement | null>;
    items: RefObject<Map<string, HTMLDivElement>>;
    focusedItem: RefObject<string | null>;
    focus(value?: string | null): void;
    removeValue(value: string): void;
    editValue(value: string): void;
    addValue(value: string): void;
    setInputValue(value: string): void;
    commit(): void;
    cancel(): void;
  },
) {
  const value = tagsValue(options, service.state.context);
  const inputValue = tagsInput(options, service.state.context);
  const editingValue = service.state.context.editing;
  const activeValue = service.state.context.active;
  const data = (part: string) => ({ 'data-scope': 'tags-input', 'data-part': part });
  function keydown(event: KeyboardEvent<HTMLInputElement | HTMLDivElement>, tag: string | null) {
    const props = service.getProps();
    if (
      props.disabled ||
      event.nativeEvent.isComposing ||
      event.keyCode === 229 ||
      service.getSnapshot().context.composing ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.shiftKey
    )
      return;
    const values = tagsValue(props, service.getSnapshot().context);
    const dir =
      options.dir ?? event.currentTarget.ownerDocument.defaultView?.getComputedStyle(event.currentTarget).direction;
    const backward = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    const forward = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    if (tag !== null) {
      if (event.target !== event.currentTarget) return;
      const index = values.indexOf(tag);
      if ([backward, forward, 'Home', 'End', 'Escape'].includes(event.key)) {
        event.preventDefault();
        actions.focus(
          event.key === 'Home'
            ? (values[0] ?? null)
            : event.key === 'End' || event.key === 'Escape'
              ? null
              : event.key === backward
                ? (values[Math.max(0, index - 1)] ?? null)
                : (values[index + 1] ?? null),
        );
      } else if (!props.readOnly && (event.key === 'Backspace' || event.key === 'Delete')) {
        event.preventDefault();
        actions.removeValue(tag);
      } else if (!props.readOnly && (event.key === 'Enter' || event.key === 'F2')) {
        event.preventDefault();
        actions.editValue(tag);
      }
      return;
    }
    const node = event.currentTarget as HTMLInputElement;
    if (service.getSnapshot().context.editing !== null && event.key === 'Escape') {
      event.preventDefault();
      actions.cancel();
    } else if (
      !props.readOnly &&
      (event.key === 'Enter' || (options.delimiters ?? [',', ';', '\n']).includes(event.key))
    ) {
      event.preventDefault();
      actions.commit();
    } else if (
      service.getSnapshot().context.editing === null &&
      values.length &&
      node.selectionStart === 0 &&
      node.selectionEnd === 0 &&
      (event.key === backward || (event.key === 'Backspace' && !node.value))
    ) {
      event.preventDefault();
      actions.focus(values.at(-1)!);
    }
  }
  return {
    value,
    inputValue,
    activeValue,
    editingValue,
    error: service.state.context.error,
    message: service.state.context.message,
    ids: text.ids,
    focus: actions.focus,
    addValue: actions.addValue,
    removeValue: actions.removeValue,
    editValue: actions.editValue,
    setInputValue: actions.setInputValue,
    commit: actions.commit,
    cancel: actions.cancel,
    getRootProps(user: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(text.getRootProps(user), {
        ...data('root'),
        ref: actions.root,
        dir: options.dir,
        onBlur(event) {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            actions.focusedItem.current = null;
            service.send({ type: 'ACTIVE', value: null });
          }
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
    getInputProps(user: TextFieldInputProps = {}): PartProps<'input'> {
      return mergeProps<'input'>(text.getInputProps(user), {
        ...data('input'),
        ref: actions.ref,
        onFocus() {
          actions.focusedItem.current = null;
          service.send({ type: 'ACTIVE', value: null });
        },
        onKeyDown(event) {
          keydown(event, null);
        },
        onCompositionStart() {
          service.send({ type: 'COMPOSITION', active: true });
        },
        onCompositionEnd() {
          service.send({ type: 'COMPOSITION', active: false });
        },
        onPaste(event) {
          if (options.disabled || options.readOnly || service.getSnapshot().context.composing || editingValue !== null)
            return;
          const node = event.currentTarget;
          const candidate =
            node.value.slice(0, node.selectionStart ?? 0) +
            event.clipboardData.getData('text') +
            node.value.slice(node.selectionEnd ?? node.value.length);
          const values = splitTags(candidate, options.delimiters ?? [',', ';', '\n']);
          if (values.length < 2) return;
          event.preventDefault();
          service.send({ type: 'ADD', values: values.filter((part) => part.trim()) });
        },
      });
    },
    getItemProps(tag: string, user: PartProps<'div'> = {}): PartProps<'div'> {
      if (!value.includes(tag)) throw new Error(`Unknown tag: ${tag}`);
      return mergeProps<'div'>(user, {
        ...data('item'),
        role: 'group',
        tabIndex: -1,
        'aria-label': tag,
        'data-value': tag,
        'data-active': tag === activeValue ? '' : undefined,
        'data-editing': tag === editingValue ? '' : undefined,
        ref(node) {
          if (!node) return;
          actions.items.current.set(tag, node);
          return () => {
            if (actions.items.current.get(tag) === node) actions.items.current.delete(tag);
          };
        },
        onFocus() {
          actions.focusedItem.current = tag;
          service.send({ type: 'ACTIVE', value: tag });
        },
        onKeyDown(event) {
          keydown(event, tag);
        },
        onDoubleClick() {
          actions.editValue(tag);
        },
      });
    },
    getRemoveProps(tag: string, user: PartProps<'button'> = {}): PartProps<'button'> {
      return mergeProps<'button'>(user, {
        ...data('remove'),
        type: 'button',
        disabled: !!options.disabled || !!options.readOnly,
        'aria-label': user['aria-label'] ?? options.getRemoveLabel?.(tag) ?? `Remove ${tag}`,
        onClick() {
          actions.removeValue(tag);
        },
      });
    },
    getHiddenInputProps(tag: string, user: PartProps<'input'> = {}): PartProps<'input'> {
      return mergeProps<'input'>(user, {
        ...data('hidden-input'),
        type: 'hidden',
        value: tag,
        name: options.name,
        form: options.form,
        disabled: options.disabled,
      });
    },
    getStatusProps(user: PartProps<'span'> = {}): PartProps<'span'> {
      return mergeProps<'span'>(user, {
        ...data('status'),
        role: 'status',
        'aria-live': 'polite',
        'aria-atomic': true,
      });
    },
  };
}
export type TagsInputApi = ReturnType<typeof connectTagsInput>;
