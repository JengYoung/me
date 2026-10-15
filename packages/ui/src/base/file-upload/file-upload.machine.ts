import { createMachine } from '../_shared/core/index';

/** Browser resources stay in the hook; the machine only receives file metadata. */
export interface FileUploadFile {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}
export type FileUploadRejectionReason = 'type' | 'too-small' | 'too-large' | 'too-many' | 'duplicate';
export interface FileUploadRejection {
  file: FileUploadFile;
  errors: readonly FileUploadRejectionReason[];
}
export interface FileUploadRules {
  accept?: string;
  multiple?: boolean;
  minFileSize?: number;
  maxFileSize?: number;
  maxFiles?: number;
  duplicatePolicy?: 'reject' | 'replace';
  disabled?: boolean;
}
export function fileUploadKey(file: FileUploadFile) {
  return JSON.stringify([file.name, file.size, file.type, file.lastModified]);
}
export function validateFileUploadRules(rules: FileUploadRules) {
  const min = rules.minFileSize ?? 0;
  const max = rules.maxFileSize ?? Infinity;
  if (!Number.isFinite(min) || min < 0 || !(max >= min)) throw new Error('Invalid file size limits.');
  if (rules.maxFiles !== undefined && (!Number.isInteger(rules.maxFiles) || rules.maxFiles < 1))
    throw new Error('maxFiles must be a positive integer.');
}
export function validateFiles(
  incoming: readonly FileUploadFile[],
  existing: readonly FileUploadFile[],
  rules: FileUploadRules,
) {
  validateFileUploadRules(rules);
  const files = [...existing];
  const accepted: FileUploadFile[] = [];
  const rejected: FileUploadRejection[] = [];
  const accepts = (rules.accept ?? '')
    .toLowerCase()
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  const limit = rules.multiple ? (rules.maxFiles ?? Infinity) : 1;
  for (const file of incoming) {
    const errors: FileUploadRejectionReason[] = [];
    const duplicate = files.findIndex((entry) => fileUploadKey(entry) === fileUploadKey(file));
    if (
      accepts.length &&
      !accepts.some((token) =>
        token.startsWith('.')
          ? file.name.toLowerCase().endsWith(token)
          : token.endsWith('/*')
            ? file.type.toLowerCase().startsWith(token.slice(0, -1))
            : file.type.toLowerCase() === token,
      )
    )
      errors.push('type');
    if (file.size < (rules.minFileSize ?? 0)) errors.push('too-small');
    if (file.size > (rules.maxFileSize ?? Infinity)) errors.push('too-large');
    if (duplicate >= 0 && rules.duplicatePolicy !== 'replace') errors.push('duplicate');
    if (duplicate < 0 && files.length >= limit) errors.push('too-many');
    if (errors.length) rejected.push({ file, errors });
    else {
      if (duplicate >= 0) files[duplicate] = file;
      else files.push(file);
      accepted.push(file);
    }
  }
  return { files, accepted, rejected };
}
export interface FileUploadSchema {
  state: 'idle' | 'dragging';
  props: FileUploadRules & {
    files?: readonly FileUploadFile[];
    defaultFiles?: readonly FileUploadFile[];
    onFilesChange?: (files: readonly FileUploadFile[]) => void;
    onReject?: (files: readonly FileUploadRejection[]) => void;
  };
  context: {
    files: readonly FileUploadFile[];
    initial: readonly FileUploadFile[];
    rejected: readonly FileUploadRejection[];
  };
  event:
    | { type: 'ADD'; files: readonly FileUploadFile[] }
    | { type: 'REMOVE'; key: string }
    | { type: 'RESET' }
    | { type: 'CLEAR' }
    | { type: 'DRAG' }
    | { type: 'LEAVE' };
}
export const selectedFiles = (props: FileUploadSchema['props'], context: FileUploadSchema['context']) =>
  props.files ?? context.files;
export const fileUploadMachine = createMachine<FileUploadSchema>({
  initial: 'idle',
  context: ({ props }) => ({
    files: [...(props.defaultFiles ?? [])],
    initial: [...(props.defaultFiles ?? [])],
    rejected: [],
  }),
  states: { idle: {}, dragging: {} },
  onProps: { guard: ({ props }) => !!props.disabled, target: 'idle' },
  on: {
    DRAG: { guard: ({ props }) => !props.disabled, target: 'dragging' },
    LEAVE: { target: 'idle' },
    ADD: {
      guard: ({ props }) => !props.disabled,
      target: 'idle',
      assign: ({ props, context, event }) => {
        const result = validateFiles(event.files, selectedFiles(props, context), props);
        return { files: props.files === undefined ? result.files : context.files, rejected: result.rejected };
      },
      actions: [
        ({ props, context, event }) => {
          // Validation uses the previous selection in controlled mode; uncontrolled accepted entries are already committed.
          if (context.rejected.length) props.onReject?.(context.rejected);
          if (context.rejected.length < event.files.length)
            props.onFilesChange?.(
              props.files === undefined ? context.files : validateFiles(event.files, props.files, props).files,
            );
        },
      ],
    },
    REMOVE: {
      guard: ({ props, context, event }) =>
        !props.disabled && selectedFiles(props, context).some((file) => fileUploadKey(file) === event.key),
      assign: ({ props, context, event }) => ({
        files:
          props.files === undefined ? context.files.filter((file) => fileUploadKey(file) !== event.key) : context.files,
      }),
      actions: [
        ({ props, context, event }) =>
          props.onFilesChange?.(selectedFiles(props, context).filter((file) => fileUploadKey(file) !== event.key)),
      ],
    },
    CLEAR: {
      guard: ({ props }) => !props.disabled,
      target: 'idle',
      assign: ({ props, context }) => ({ files: props.files === undefined ? [] : context.files, rejected: [] }),
      actions: [({ props }) => props.onFilesChange?.([])],
    },
    RESET: {
      target: 'idle',
      assign: ({ props, context }) => ({
        files: props.files === undefined ? context.initial : context.files,
        rejected: [],
      }),
      actions: [({ props, context }) => props.onFilesChange?.(context.initial)],
    },
  },
});
