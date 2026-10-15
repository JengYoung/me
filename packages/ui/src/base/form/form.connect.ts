import { mergeProps } from '../_shared/react/index';
import type { PartProps } from '../_shared/react/index';
import type { FormAdapter, FormSnapshot } from './form.types';
import type { FormOptions } from './use-form';

export function connectForm(
  adapter: FormAdapter,
  snapshot: FormSnapshot,
  options: FormOptions & { id: string },
  dom: {
    registerControl: (name: string, node: HTMLElement) => () => void;
    focusField: (name: string) => boolean;
    focusError: () => boolean;
  },
) {
  const submit = async (data?: FormData) => {
    const valid = await adapter.submit(data);
    if (!valid && options.focusOnError !== false) dom.focusError();
    return valid;
  };
  return {
    id: options.id,
    adapter,
    snapshot,
    disabled: !!options.disabled,
    readOnly: !!options.readOnly,
    ...dom,
    submit,
    validate: adapter.validate,
    reset: adapter.reset,
    setValue: adapter.setValue,
    setErrors: adapter.setErrors,
    getRootProps(user: PartProps<'form'> = {}): PartProps<'form'> {
      return mergeProps<'form'>(user, {
        id: options.id,
        noValidate: true,
        'aria-busy': snapshot.submitting || snapshot.validating.length > 0,
        'data-scope': 'form',
        'data-part': 'root',
        'data-submitting': snapshot.submitting,
        onSubmit(event) {
          event.preventDefault();
          const native = event.nativeEvent as SubmitEvent;
          void submit(new FormData(event.currentTarget, native.submitter));
        },
        onReset(event) {
          event.preventDefault();
          adapter.reset();
        },
      });
    },
    getSummaryProps(user: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(user, {
        id: `${options.id}-summary`,
        role: 'alert',
        tabIndex: -1,
        'data-scope': 'form',
        'data-part': 'summary',
      });
    },
    getErrorLinkProps(name: string, user: PartProps<'a'> = {}): PartProps<'a'> {
      return mergeProps<'a'>(user, {
        href: `#${options.id}-field-${encodeURIComponent(name)}`,
        onClick(event) {
          event.preventDefault();
          dom.focusField(name);
        },
      });
    },
    getSubmitProps(user: PartProps<'button'> = {}): PartProps<'button'> {
      return mergeProps<'button'>(user, {
        type: 'submit',
        form: options.id,
        disabled: !!user.disabled || !!options.disabled || snapshot.submitting,
        'data-scope': 'form',
        'data-part': 'submit',
      });
    },
    getResetProps(user: PartProps<'button'> = {}): PartProps<'button'> {
      return mergeProps<'button'>(user, {
        type: 'reset',
        form: options.id,
        disabled: !!user.disabled || !!options.disabled,
        'data-scope': 'form',
        'data-part': 'reset',
      });
    },
  };
}
