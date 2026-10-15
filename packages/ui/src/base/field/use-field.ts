'use client';

import { useStableId } from "../_shared/react/index";
import { connectField } from "./field.connect";

export interface FieldOptions {
  /** The control ID. Explicit IDs must be unique within the document. */
  id?: string;
  ids?: { label?: string; description?: string; error?: string };
  /** Declare default parts in the same render that adds/removes them, including SSR. */
  label?: boolean;
  description?: boolean;
  error?: boolean;
  /** Additional mounted description/error IDs, in reading order. */
  descriptionIds?: readonly string[];
  errorIds?: readonly string[];
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
}

export function useField(options: FieldOptions = {}) {
  const id = useStableId('iris-field', options.id);
  return connectField({ ...options, id });
}

export type { FieldApi } from "./field.connect";
