import { mergeProps } from '../_shared/react/index';
import type { MachineApi, PartProps } from '../_shared/react/index';
import type { FieldApi } from '../field/index';
import type { Ref } from 'react';
import { fileUploadKey } from './file-upload.machine';
import type { FileUploadFile, FileUploadSchema } from './file-upload.machine';
import type { FileUploadOptions } from './use-file-upload';

export function connectFileUpload(
  machine: MachineApi<FileUploadSchema>,
  options: FileUploadOptions & { id: string },
  field: FieldApi,
  dom: {
    acceptedFiles: readonly File[];
    addFiles(files: Iterable<File>): void;
    reset(): void;
    open(): void;
    inputRef: Ref<HTMLInputElement>;
  },
) {
  const { send, state } = machine;
  const data = (part: string) => ({
    'data-scope': 'file-upload',
    'data-part': part,
    'data-state': state.value,
    'data-disabled': options.disabled ? '' : undefined,
  });
  const removeFile = (file: FileUploadFile) => send({ type: 'REMOVE', key: fileUploadKey(file) });
  const feedback = `${dom.acceptedFiles.length} file(s) selected. ${state.context.rejected.map(({ file, errors }) => `${file.name}: ${errors.join(', ')}.`).join(' ')}`;
  return {
    acceptedFiles: dom.acceptedFiles,
    rejectedFiles: state.context.rejected,
    dragging: state.value === 'dragging',
    feedback,
    addFiles: dom.addFiles,
    removeFile,
    clear: () => send({ type: 'CLEAR' }),
    reset: dom.reset,
    open: dom.open,
    getRootProps: (user: PartProps<'div'> = {}) => mergeProps<'div'>(user, data('root')),
    getLabelProps: (user: PartProps<'label'> = {}) => mergeProps<'label'>(field.getLabelProps(user), data('label')),
    getDescriptionProps: (user: PartProps<'span'> = {}) =>
      mergeProps<'span'>(field.getDescriptionProps(user), data('description')),
    getInputProps(user: PartProps<'input'> = {}): PartProps<'input'> {
      return mergeProps<'input'>(field.getControlProps(user), {
        ...data('input'),
        type: 'file',
        name: '',
        form: options.form,
        accept: options.accept,
        multiple: !!options.multiple,
        required: false,
        disabled: !!options.disabled || !!user.disabled,
        ref: dom.inputRef,
        // The picker is transient. FormData receives the accepted list through the owning form's formdata event.
        onChange: (event) => {
          if (!user.disabled) dom.addFiles(Array.from(event.currentTarget.files ?? []));
          event.currentTarget.value = '';
        },
      });
    },
    getTriggerProps(user: PartProps<'button'> = {}): PartProps<'button'> {
      return mergeProps<'button'>(user, {
        ...data('trigger'),
        type: 'button',
        disabled: !!options.disabled || !!user.disabled,
        'aria-controls': options.id,
        onClick: () => {
          if (!user.disabled) dom.open();
        },
      });
    },
    getDropzoneProps(user: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(user, {
        ...data('dropzone'),
        role: 'group',
        'aria-disabled': !!options.disabled,
        onDragEnter: (event) => {
          if (!options.disabled && event.dataTransfer.types.includes('Files')) send({ type: 'DRAG' });
        },
        onDragOver: (event) => {
          if (!options.disabled && event.dataTransfer.types.includes('Files')) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
          }
        },
        onDragLeave: (event) => {
          if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget))
            send({ type: 'LEAVE' });
        },
        onDrop: (event) => {
          event.preventDefault();
          send({ type: 'LEAVE' });
          dom.addFiles(Array.from(event.dataTransfer.files));
        },
      });
    },
    getItemProps: (file: FileUploadFile, user: PartProps<'li'> = {}) =>
      mergeProps<'li'>(user, { ...data('item'), 'data-file-key': fileUploadKey(file) }),
    getRemoveProps(file: FileUploadFile, user: PartProps<'button'> = {}): PartProps<'button'> {
      return mergeProps<'button'>(user, {
        ...data('remove'),
        type: 'button',
        disabled: !!options.disabled || !!user.disabled,
        'aria-label': user['aria-label'] ?? `Remove ${file.name}`,
        onClick: (event) => {
          if (user.disabled) return;
          removeFile(file);
          event.currentTarget.ownerDocument.getElementById(options.id)?.focus();
        },
      });
    },
    getFeedbackProps: (user: PartProps<'span'> = {}) =>
      mergeProps<'span'>(user, {
        ...data('feedback'),
        role: 'status',
        'aria-live': 'polite',
        'aria-atomic': true,
        children: user.children ?? feedback,
      }),
  };
}
export type FileUploadApi = ReturnType<typeof connectFileUpload>;
