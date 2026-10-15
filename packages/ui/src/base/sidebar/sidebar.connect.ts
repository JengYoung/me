import { mergeProps } from "../_shared/react/index";
import type { PartProps } from "../_shared/react/index";
import type { DisclosureApi } from "../disclosure/index";
export function connectSidebar(
  disclosure: DisclosureApi,
  options: { id: string; dir: 'ltr' | 'rtl'; toggle(): void },
  refs: { setTrigger(node: HTMLButtonElement | null): void; setContent(node: HTMLDivElement | null): void },
) {
  const attributes = (part: string) => ({
    'data-scope': 'sidebar',
    'data-part': part,
    'data-state': disclosure.open ? 'expanded' : 'collapsed',
  });
  return {
    expanded: disclosure.open,
    toggle: options.toggle,
    setExpanded: disclosure.setOpen,
    getTriggerProps(props: PartProps<'button'> = {}): PartProps<'button'> {
      return mergeProps<'button'>(disclosure.getTriggerProps(props), {
        ...attributes('trigger'),
        ref: refs.setTrigger,
      });
    },
    getContentProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(disclosure.getContentProps(props), {
        ...attributes('content'),
        ref: refs.setContent,
        dir: options.dir,
      });
    },
    getNavProps: (props: PartProps<'nav'> = {}) => mergeProps<'nav'>(props, { ...attributes('nav') }),
    getTitleProps: (props: PartProps<'h2'> = {}) =>
      mergeProps<'h2'>(props, { ...attributes('title'), id: props.id ?? `${options.id}-title` }),
    getDescriptionProps: (props: PartProps<'p'> = {}) =>
      mergeProps<'p'>(props, { ...attributes('description'), id: props.id ?? `${options.id}-description` }),
    getCloseProps: (props: PartProps<'button'> = {}) =>
      mergeProps<'button'>(props, {
        ...attributes('close'),
        type: props.type ?? 'button',
        onClick: () => {
          if (!props.disabled) disclosure.setOpen(false);
        },
      }),
  };
}
export type SidebarApi = ReturnType<typeof connectSidebar>;
