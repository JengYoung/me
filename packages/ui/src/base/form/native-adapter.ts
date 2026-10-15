import { emptyFormValue, equalFormValue } from './form.types';
import type {
  FormAdapter,
  FormEngineOptions,
  FormErrors,
  FormFieldRules,
  FormSnapshot,
  FormValues,
} from './form.types';

const message = (error: unknown) =>
  error instanceof Error ? error.message : 'The operation failed. Please try again.';
const own = <T>(record: Readonly<Record<string, T>>, name: string): T | undefined =>
  Object.hasOwn(record, name) ? record[name] : undefined;
const omit = <T>(record: Readonly<Record<string, T>>, name: string) =>
  Object.fromEntries(Object.entries(record).filter(([key]) => key !== name));
const definedRules = (rules: FormFieldRules) =>
  Object.fromEntries(Object.entries(rules).filter(([, value]) => value !== undefined));
function cancellable<T>(work: T | Promise<T>, signal: AbortSignal): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const abort = () => {
      signal.removeEventListener('abort', abort);
      resolve(undefined);
    };
    if (signal.aborted) {
      resolve(undefined);
      return;
    }
    signal.addEventListener('abort', abort, { once: true });
    Promise.resolve(work).then(
      (value) => {
        signal.removeEventListener('abort', abort);
        resolve(value);
      },
      (error: unknown) => {
        signal.removeEventListener('abort', abort);
        reject(error);
      },
    );
  });
}

/** Dependency-free engine adapter. The UI subscribes to this store instead of copying its state. */
export function createNativeFormAdapter(initial: FormEngineOptions = {}): FormAdapter {
  let options = initial;
  const controlled = initial.values !== undefined;
  let defaults: FormValues = { ...initial.defaultValues };
  let values: FormValues = controlled ? {} : { ...defaults };
  let snapshot: FormSnapshot = {
    values: initial.values ?? values,
    errors: {},
    touched: {},
    dirty: {},
    validating: [],
    submitting: false,
    submitted: false,
    submitCount: 0,
  };
  const listeners = new Set<() => void>();
  const fields = new Map<string, { token: object; rules: FormFieldRules }>();
  const jobs = new Map<string, AbortController>();
  let submission: AbortController | undefined;
  let revision = 0;
  let active = true;
  const names = () => [...new Set([...Object.keys(options.fields ?? {}), ...fields.keys()])];
  const currentValues = () => options.values ?? values;
  function getFieldRules(name: string): FormFieldRules {
    return { ...own(options.fields ?? {}, name), ...definedRules(fields.get(name)?.rules ?? {}) };
  }
  function publish(patch: Partial<FormSnapshot> = {}) {
    const current = currentValues();
    const dirty = Object.fromEntries(
      Object.keys(current).map((name) => [name, !equalFormValue(own(current, name), own(defaults, name))]),
    );
    snapshot = { ...snapshot, ...patch, values: current, dirty, validating: [...jobs.keys()] };
    listeners.forEach((listener) => listener());
  }
  function cancel() {
    revision++;
    jobs.forEach((job) => job.abort());
    jobs.clear();
    submission?.abort();
    submission = undefined;
  }
  function remove(name: string, rules: FormFieldRules) {
    cancel();
    if (rules.retainValue === false) {
      defaults = omit(defaults, name);
      if (!controlled) values = omit(values, name);
    }
    publish({ errors: omit(snapshot.errors, name), touched: omit(snapshot.touched, name), submitting: false });
  }
  function initialize(name: string, rules: FormFieldRules) {
    if (rules.defaultValue === undefined || Object.hasOwn(defaults, name)) return;
    defaults = { ...defaults, [name]: rules.defaultValue };
    if (!controlled && !Object.hasOwn(values, name)) values = { ...values, [name]: rules.defaultValue };
  }
  for (const [name, rules] of Object.entries(initial.fields ?? {})) initialize(name, rules);
  // Initial snapshot is computed before any subscription (also used for SSR).
  publish();

  async function validate(requested: readonly string[] = names()): Promise<boolean> {
    if (!active || options.disabled) return false;
    const start = revision;
    const input = currentValues();
    const targets = [...new Set(requested)].filter((name) => names().includes(name));
    const tasks = targets.map(async (name) => {
      jobs.get(name)?.abort();
      const job = new AbortController();
      jobs.set(name, job);
      const rules = getFieldRules(name);
      let error: string | undefined;
      try {
        if (!rules.disabled) {
          const value = own(input, name);
          error =
            rules.required && emptyFormValue(value)
              ? (rules.requiredMessage ?? 'This field is required.')
              : (await cancellable(rules.validate?.(value, { values: input, signal: job.signal }), job.signal)) ||
                undefined;
        }
      } catch (cause) {
        error = message(cause);
      }
      if (!active || job.signal.aborted || jobs.get(name) !== job || revision !== start) return false;
      jobs.delete(name);
      publish({ errors: { ...omit(snapshot.errors, name), ...(error ? { [name]: error } : {}) } });
      return !error;
    });
    publish({ touched: { ...snapshot.touched, ...Object.fromEntries(targets.map((name) => [name, true])) } });
    const results = await Promise.all(tasks);
    return active && revision === start && results.every(Boolean);
  }
  function setErrors(errors: FormErrors, formError?: string) {
    jobs.forEach((job) => job.abort());
    jobs.clear();
    publish({
      errors: Object.fromEntries(Object.entries(errors).filter(([, error]) => !!error)),
      formError,
      submitted: false,
    });
  }
  const adapter: FormAdapter = {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getFieldRules,
    configure(next) {
      if (controlled !== (next.values !== undefined)) throw new Error('Form cannot switch value control modes.');
      const previousNames = names();
      const previousRules = new Map(previousNames.map((name) => [name, getFieldRules(name)]));
      const changedNames =
        next.values === options.values
          ? []
          : Object.keys({ ...options.values, ...next.values }).filter(
              (name) => !equalFormValue(own(options.values ?? {}, name), own(next.values ?? {}, name)),
            );
      const changedValues = changedNames.length > 0;
      const changedMode = next.disabled !== options.disabled || next.readOnly !== options.readOnly;
      options = next;
      let changed = changedValues || changedMode;
      for (const name of previousNames) {
        if (!names().includes(name)) {
          remove(name, previousRules.get(name)!);
          changed = true;
        } else {
          const before = previousRules.get(name)!;
          const after = getFieldRules(name);
          if (
            before.disabled !== after.disabled ||
            before.required !== after.required ||
            before.validationKey !== after.validationKey
          )
            changed = true;
        }
      }
      for (const [name, rules] of Object.entries(next.fields ?? {})) {
        if (!previousNames.includes(name)) changed = true;
        initialize(name, rules);
      }
      if (changed) {
        cancel();
        publish({ submitting: false, submitted: false });
        if (changedValues && options.validationMode === 'change') void validate(changedNames);
      }
    },
    connect() {
      active = true;
      return () => {
        active = false;
        cancel();
        publish({ submitting: false });
      };
    },
    register(name, rules = {}) {
      if (!name.trim()) throw new Error('Form field names must be nonempty.');
      if (fields.has(name))
        throw new Error(`Form field ${name} already has a mounted owner. Use one hook for a choice group.`);
      const token = {};
      fields.set(name, { token, rules });
      const added = !Object.hasOwn(options.fields ?? {}, name);
      if (added) cancel();
      initialize(name, rules);
      publish(added ? { submitting: false, submitted: false } : {});
      return {
        update(next) {
          const entry = fields.get(name);
          if (entry?.token !== token) return;
          const changed =
            entry.rules.disabled !== next.disabled ||
            entry.rules.required !== next.required ||
            entry.rules.readOnly !== next.readOnly ||
            entry.rules.validationKey !== next.validationKey;
          entry.rules = next;
          const before = values;
          initialize(name, next);
          if (changed || before !== values) {
            cancel();
            publish({ submitting: false });
          }
        },
        unregister() {
          if (fields.get(name)?.token !== token) return;
          const before = getFieldRules(name);
          fields.delete(name);
          if (!Object.hasOwn(options.fields ?? {}, name)) remove(name, before);
        },
      };
    },
    setValue(name, value) {
      const rules = getFieldRules(name);
      if (
        !active ||
        options.disabled ||
        options.readOnly ||
        rules.disabled ||
        rules.readOnly ||
        equalFormValue(own(currentValues(), name), value)
      )
        return;
      const next = { ...currentValues(), [name]: value };
      cancel();
      if (!controlled) values = next;
      publish({ errors: omit(snapshot.errors, name), formError: undefined, submitting: false, submitted: false });
      options.onValuesChange?.(next);
      // A controlled request can be rejected. Validate only the accepted, committed values.
      if (options.validationMode === 'change') void validate([name]);
    },
    touch(name) {
      if (!active || options.disabled || getFieldRules(name).disabled) return;
      publish({ touched: { ...snapshot.touched, [name]: true } });
      if (options.validationMode === 'blur') void validate([name]);
    },
    validate,
    async submit(formData) {
      if (!active || options.disabled || snapshot.submitting) return false;
      const job = new AbortController();
      submission = job;
      const start = revision;
      publish({ submitting: true, submitted: false, formError: undefined, submitCount: snapshot.submitCount + 1 });
      try {
        if (!(await validate()) || job.signal.aborted || revision !== start) return false;
        const submittedValues = Object.fromEntries(
          names()
            .filter((name) => !getFieldRules(name).disabled)
            .map((name) => [name, own(currentValues(), name)]),
        );
        await cancellable(
          options.onSubmit?.(submittedValues, {
            signal: job.signal,
            formData,
            setErrors: (errors, formError) => {
              if (active && !job.signal.aborted && revision === start) setErrors(errors, formError);
            },
          }),
          job.signal,
        );
        if (!active || job.signal.aborted || revision !== start) return false;
        const success = !snapshot.formError && !Object.values(snapshot.errors).some(Boolean);
        publish({ submitted: success });
        return success;
      } catch (cause) {
        if (active && !job.signal.aborted && revision === start) publish({ formError: message(cause) });
        return false;
      } finally {
        if (submission === job) {
          submission = undefined;
          publish({ submitting: false });
        }
      }
    },
    reset(next) {
      cancel();
      if (next) defaults = { ...next };
      if (!controlled) values = { ...defaults };
      publish({ errors: {}, touched: {}, submitting: false, submitted: false, submitCount: 0, formError: undefined });
      options.onValuesChange?.({ ...defaults });
    },
    setErrors,
  };
  return adapter;
}
