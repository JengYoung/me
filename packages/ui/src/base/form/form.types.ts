export type FormValue = string | number | boolean | readonly string[] | null;
/** Names are literal keys, including dots/brackets; the engine never evaluates paths. */
export type FormValues = Readonly<Record<string, FormValue | undefined>>;
export type FormErrors = Readonly<Record<string, string | undefined>>;
export type FormValidationMode = 'submit' | 'blur' | 'change';
export interface FormFieldRules {
  required?: boolean;
  requiredMessage?: string;
  disabled?: boolean;
  readOnly?: boolean;
  defaultValue?: FormValue;
  /** Retain unmounted values by default. Unregistered fields are not validated/submitted. */
  retainValue?: boolean;
  /** Change this when an async validation's schema changes without changing the value. */
  validationKey?: string | number;
  validate?: (
    value: FormValue | undefined,
    context: { values: FormValues; signal: AbortSignal },
  ) => string | undefined | null | Promise<string | undefined | null>;
}
export interface FormSubmitContext {
  signal: AbortSignal;
  formData?: FormData;
  setErrors: (errors: FormErrors, formError?: string) => void;
}
export interface FormEngineOptions {
  defaultValues?: FormValues;
  values?: FormValues;
  onValuesChange?: (values: FormValues) => void;
  fields?: Readonly<Record<string, FormFieldRules>>;
  validationMode?: FormValidationMode;
  disabled?: boolean;
  readOnly?: boolean;
  onSubmit?: (values: FormValues, context: FormSubmitContext) => void | Promise<void>;
}
export interface FormSnapshot {
  values: FormValues;
  errors: FormErrors;
  touched: Readonly<Record<string, boolean>>;
  dirty: Readonly<Record<string, boolean>>;
  validating: readonly string[];
  submitting: boolean;
  submitted: boolean;
  submitCount: number;
  formError?: string;
}
/** Stable external-store contract. One mounted useForm owns an adapter's lifecycle. */
export interface FormAdapter {
  getSnapshot: () => FormSnapshot;
  subscribe: (listener: () => void) => () => void;
  configure: (options: FormEngineOptions) => void;
  connect: () => () => void;
  register: (
    name: string,
    rules?: FormFieldRules,
  ) => { update: (rules: FormFieldRules) => void; unregister: () => void };
  getFieldRules: (name: string) => FormFieldRules;
  setValue: (name: string, value: FormValue) => void;
  touch: (name: string) => void;
  validate: (names?: readonly string[]) => Promise<boolean>;
  submit: (formData?: FormData) => Promise<boolean>;
  reset: (values?: FormValues) => void;
  setErrors: (errors: FormErrors, formError?: string) => void;
}
export function equalFormValue(a: FormValue | undefined, b: FormValue | undefined) {
  return (
    Object.is(a, b) || (Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i]))
  );
}
export const emptyFormValue = (value: FormValue | undefined) =>
  value === undefined ||
  value === null ||
  value === false ||
  (typeof value === 'string' && !value.trim()) ||
  (Array.isArray(value) && value.length === 0);
