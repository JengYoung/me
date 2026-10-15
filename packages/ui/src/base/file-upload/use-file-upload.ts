'use client';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { mergeRefs, useFormReset, useMachine, useStableId } from "../_shared/react/index";
import { useField } from "../field/index";
import type { FieldOptions } from "../field/index";
import {
  fileUploadKey,
  fileUploadMachine,
  selectedFiles,
  validateFiles,
  validateFileUploadRules,
} from "./file-upload.machine";
import type { FileUploadFile, FileUploadRejection, FileUploadRules } from "./file-upload.machine";
import { connectFileUpload } from "./file-upload.connect";

export interface FileUploadOptions extends FileUploadRules, Omit<FieldOptions, 'readOnly'> {
  files?: readonly File[];
  defaultFiles?: readonly File[];
  onFilesChange?: (files: File[]) => void;
  onReject?: (rejected: readonly FileUploadRejection[]) => void;
  name?: string;
  form?: string;
}
const metadata = ({ name, size, type, lastModified }: File): FileUploadFile => ({ name, size, type, lastModified });
export function useFileUpload(options: FileUploadOptions = {}) {
  validateFileUploadRules(options);
  const [controlled] = useState(options.files !== undefined);
  const [initial] = useState(() => [...(options.defaultFiles ?? [])]);
  const [resources] = useState(() => new Map(initial.map((file) => [fileUploadKey(file), file])));
  const latest = useRef(options);
  const input = useRef<HTMLInputElement | null>(null);
  const id = useStableId('iris-file-upload', options.id);
  const resolve = (entries: readonly FileUploadFile[]) =>
    entries.flatMap((entry) => {
      const key = fileUploadKey(entry);
      const file =
        resources.get(key) ??
        latest.current.files?.find((item) => fileUploadKey(item) === key) ??
        initial.find((item) => fileUploadKey(item) === key);
      return file ? [file] : [];
    });
  const service = useMachine(fileUploadMachine, {
    props: {
      ...options,
      files: options.files?.map(metadata),
      defaultFiles: initial.map(metadata),
      onFilesChange: (files) => {
        const next = resolve(files);
        const keep = new Set(options.files === undefined ? files.map(fileUploadKey) : []);
        for (const key of resources.keys()) if (!keep.has(key)) resources.delete(key);
        options.onFilesChange?.(next);
      },
    },
  });
  const { send, getSnapshot, getProps } = service;
  useLayoutEffect(() => {
    latest.current = options;
  }, [options]);
  const acceptedFiles =
    options.files ??
    service.state.context.files.flatMap((entry) => {
      const file =
        resources.get(fileUploadKey(entry)) ?? initial.find((item) => fileUploadKey(item) === fileUploadKey(entry));
      return file ? [file] : [];
    });
  const field = useField({ ...options, id, invalid: options.invalid || service.state.context.rejected.length > 0 });
  const readFiles = useCallback(
    () =>
      latest.current.files ??
      selectedFiles(getProps(), getSnapshot().context).flatMap((entry) => {
        const file =
          resources.get(fileUploadKey(entry)) ?? initial.find((item) => fileUploadKey(item) === fileUploadKey(entry));
        return file ? [file] : [];
      }),
    [getProps, getSnapshot, resources, initial],
  );
  const addFiles = useCallback(
    (files: Iterable<File>) => {
      const rules = getProps();
      if (rules.disabled) return;
      const incoming = [...files];
      const entries = incoming.map(metadata);
      const result = validateFiles(entries, selectedFiles(rules, getSnapshot().context), rules);
      const accepted = new Set(result.accepted);
      const keep = new Set(readFiles().map(fileUploadKey));
      for (const key of resources.keys()) if (!keep.has(key)) resources.delete(key);
      incoming.forEach((file, index) => {
        if (accepted.has(entries[index]!)) resources.set(fileUploadKey(file), file);
      });
      send({ type: 'ADD', files: entries });
    },
    [getProps, getSnapshot, readFiles, resources, send],
  );
  const reset = useCallback(() => {
    for (const file of initial) resources.set(fileUploadKey(file), file);
    send({ type: 'RESET' });
    if (input.current) input.current.value = '';
  }, [initial, resources, send]);
  const resetRef = useFormReset(options.form, reset);
  const inputRef = useCallback(
    (element: HTMLInputElement | null) => {
      input.current = element;
      if (!element) return;
      const form = !options.form || element.form?.id === options.form ? element.form : null;
      const onFormData = (event: FormDataEvent) => {
        const current = latest.current;
        if (!current.name || current.disabled || element.matches(':disabled')) return;
        for (const file of readFiles()) event.formData.append(current.name, file, file.name);
      };
      form?.addEventListener('formdata', onFormData);
      return () => {
        form?.removeEventListener('formdata', onFormData);
        if (input.current === element) input.current = null;
      };
    },
    [readFiles, options.form],
  );
  useLayoutEffect(() => {
    input.current?.setCustomValidity(options.required && !acceptedFiles.length ? 'Please select a file.' : '');
  }, [acceptedFiles.length, options.required]);
  if (controlled !== (options.files !== undefined)) throw new Error('File Upload cannot switch control modes.');
  // connect only stores these refs/commands in event handlers; it never reads them during render.
  /* oxlint-disable react/refs */
  return connectFileUpload(service, { ...options, id }, field, {
    acceptedFiles,
    addFiles,
    reset,
    inputRef: mergeRefs(inputRef, resetRef),
    open: () => {
      if (!getProps().disabled && !input.current?.matches(':disabled')) input.current?.click();
    },
  });
  /* oxlint-enable react/refs */
}
export type { FileUploadApi } from "./file-upload.connect";
