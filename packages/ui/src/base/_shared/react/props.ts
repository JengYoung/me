import type { ComponentPropsWithRef, JSX, Ref } from 'react';
import { mergeRefs } from "./refs";

export type PartProps<Tag extends keyof JSX.IntrinsicElements> = ComponentPropsWithRef<Tag> & {
  [key: `data-${string}`]: string | number | boolean | undefined;
};

export type PropGetter<Tag extends keyof JSX.IntrinsicElements> = (props?: PartProps<Tag>) => PartProps<Tag>;

export function composeEventHandlers<Event extends { defaultPrevented: boolean }>(
  user: ((event: Event) => void) | undefined,
  internal: (event: Event) => void,
): (event: Event) => void {
  return (event) => {
    user?.(event);
    if (!event.defaultPrevented) internal(event);
  };
}

/** Defined internal attributes win; events run user-first, refs and presentation props are composed. */
export function mergeProps<Tag extends keyof JSX.IntrinsicElements>(
  user: PartProps<Tag>,
  internal: PartProps<Tag>,
): PartProps<Tag> {
  const result = { ...user };
  for (const key of Object.keys(internal)) {
    const userValue: unknown = Reflect.get(user, key);
    const internalValue: unknown = Reflect.get(internal, key);
    if (internalValue === undefined) continue;
    if (/^on[A-Z]/.test(key) && typeof internalValue === 'function') {
      Reflect.set(
        result,
        key,
        composeEventHandlers(
          typeof userValue === 'function' ? (event: { defaultPrevented: boolean }) => userValue(event) : undefined,
          (event: { defaultPrevented: boolean }) => internalValue(event),
        ),
      );
    } else Reflect.set(result, key, internalValue);
  }
  if (user.ref && internal.ref && user.ref !== internal.ref) {
    result.ref = mergeRefs(user.ref as Ref<unknown>, internal.ref as Ref<unknown>);
  } else result.ref = internal.ref ?? user.ref;
  const classNames = [user.className, internal.className].filter(Boolean);
  if (classNames.length) result.className = classNames.join(' ');
  if (user.style && internal.style) result.style = { ...user.style, ...internal.style };
  return result;
}
