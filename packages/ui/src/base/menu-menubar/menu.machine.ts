import { createMachine, getNavigationTarget, getTypeaheadTarget } from '../_shared/core/index';
import type { Direction } from '../_shared/core/index';
import { flattenMenu, menuPath, validateMenu } from './menu.model';
import type { MenuItem } from './menu.model';

export type MenuCloseReason = 'escape' | 'select' | 'tab' | 'outside' | 'programmatic';
export interface MenuStateOptions {
  items: readonly MenuItem[];
  kind?: 'menu' | 'menubar';
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  checkedValues?: readonly string[];
  defaultCheckedValues?: readonly string[];
  onCheckedValuesChange?: (values: string[]) => void;
  onSelect?: (value: string) => void;
  onClose?: (reason: MenuCloseReason) => void;
  dir?: Direction;
  loop?: boolean;
  disabled?: boolean;
  id?: string;
}
export interface MenuSchema {
  state: 'idle' | 'searching';
  props: MenuStateOptions;
  context: {
    open: boolean;
    activeValue: string | null;
    openPath: readonly string[];
    checkedValues: readonly string[];
    query: string;
    focusVersion: number;
    recoverFocus: boolean;
    closeReason: MenuCloseReason;
  };
  event:
    | { type: 'FOCUS'; value: string; focus?: boolean; keepOpen?: boolean }
    | { type: 'OPEN'; open: boolean }
    | { type: 'OPEN_SUB'; value: string; last?: boolean }
    | { type: 'BACK' }
    | { type: 'KEY'; key: string; dir?: Direction }
    | { type: 'TYPE'; character: string }
    | { type: 'CLEAR_SEARCH' }
    | { type: 'ACTIVATE'; value: string }
    | { type: 'CHECK'; value: string }
    | { type: 'CLOSE'; reason: MenuCloseReason };
}
export const menuOpen = (props: MenuStateOptions, context: Readonly<MenuSchema['context']>) =>
  !props.disabled && (props.kind === 'menubar' || (props.open ?? context.open));
export function menuChecked(props: MenuStateOptions, context: Readonly<MenuSchema['context']>) {
  const groups = new Set<string>();
  const checked = props.checkedValues ?? context.checkedValues;
  return flattenMenu(props.items)
    .filter((item) => {
      if (!checked.includes(item.value) || (item.type !== 'checkbox' && item.type !== 'radio')) return false;
      if (item.type === 'radio') {
        if (groups.has(item.group!)) return false;
        groups.add(item.group!);
      }
      return true;
    })
    .map((item) => item.value);
}
function nextChecked(props: MenuStateOptions, context: Readonly<MenuSchema['context']>, value: string) {
  const current = menuChecked(props, context);
  const item = menuPath(props.items, value).at(-1)!;
  if (item.type === 'radio')
    return [...current.filter((entry) => menuPath(props.items, entry).at(-1)?.group !== item.group), value];
  return current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value];
}
export const menuMachine = createMachine<MenuSchema>({
  initial: 'idle',
  context: ({ props }) => {
    validateMenu(props.items);
    return {
      open: props.open === undefined ? (props.defaultOpen ?? true) : false,
      activeValue: props.items[0]?.value ?? null,
      openPath: [],
      checkedValues: props.checkedValues === undefined ? (props.defaultCheckedValues ?? []) : [],
      query: '',
      focusVersion: 0,
      recoverFocus: false,
      closeReason: 'programmatic',
    };
  },
  states: {
    idle: {},
    searching: {
      effects: [
        ({ schedule }) => {
          schedule({ type: 'CLEAR_SEARCH' }, 500);
        },
      ],
    },
  },
  onProps: {
    assign: ({ props, context }) => {
      const openPath: string[] = [];
      let level = props.items;
      for (const value of context.openPath) {
        const item = level.find((entry) => entry.value === value);
        if (!item?.children || item.disabled) break;
        openPath.push(value);
        level = item.children;
      }
      const path = menuPath(props.items, context.activeValue);
      const valid = path.length > 0 && path.slice(0, -1).every((item, index) => openPath[index] === item.value);
      const next = valid ? context.activeValue : (level[0]?.value ?? null);
      return {
        activeValue: next,
        openPath: openPath.length === context.openPath.length ? context.openPath : openPath,
        focusVersion: next !== context.activeValue ? context.focusVersion + 1 : context.focusVersion,
        recoverFocus: next !== context.activeValue ? true : context.recoverFocus,
      };
    },
  },
  on: {
    FOCUS: {
      guard: ({ props, context, event }) => menuOpen(props, context) && menuPath(props.items, event.value).length > 0,
      assign: ({ props, context, event }) => ({
        activeValue: event.value,
        openPath: event.keepOpen
          ? context.openPath
          : menuPath(props.items, event.value)
              .slice(0, -1)
              .map((item) => item.value),
        focusVersion: context.focusVersion + (event.focus ? 1 : 0),
        recoverFocus: event.focus ? false : context.recoverFocus,
      }),
    },
    OPEN: {
      guard: ({ props, context, event }) =>
        !props.disabled && props.kind !== 'menubar' && event.open !== menuOpen(props, context),
      assign: ({ props, context, event }) => ({
        open: props.open === undefined ? event.open : context.open,
        openPath: [],
        activeValue: props.items[0]?.value ?? null,
        focusVersion: context.focusVersion + (event.open ? 1 : 0),
        recoverFocus: false,
      }),
      actions: [({ props, event }) => props.onOpenChange?.(event.open)],
    },
    OPEN_SUB: {
      guard: ({ props, context, event }) =>
        menuOpen(props, context) &&
        !!menuPath(props.items, event.value).at(-1)?.children?.length &&
        !menuPath(props.items, event.value).at(-1)?.disabled,
      assign: ({ props, context, event }) => {
        const path = menuPath(props.items, event.value);
        const children = path.at(-1)!.children!;
        return {
          openPath: path.map((item) => item.value),
          activeValue: (event.last ? children.at(-1)! : children[0]!).value,
          focusVersion: context.focusVersion + 1,
          recoverFocus: false,
        };
      },
    },
    BACK: {
      guard: ({ context }) => context.openPath.length > 0,
      assign: ({ context }) => ({
        activeValue: context.openPath.at(-1)!,
        openPath: context.openPath.slice(0, -1),
        focusVersion: context.focusVersion + 1,
        recoverFocus: false,
      }),
    },
    KEY: {
      guard: ({ props, context }) => menuOpen(props, context),
      actions: [
        ({ props, context, event, send }) => {
          const path = menuPath(props.items, context.activeValue);
          const item = path.at(-1);
          if (!item) return;
          const root = path.length === 1;
          const bar = props.kind === 'menubar';
          const forward = (event.dir ?? props.dir) === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
          const backward = forward === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft';
          const level = path.length > 1 ? path.at(-2)!.children! : props.items;
          const move = (intent: 'next' | 'previous' | 'first' | 'last') => {
            const next = getNavigationTarget(
              level.map((entry) => ({ ...entry, disabled: false })),
              item.value,
              intent,
              props.loop ?? true,
            );
            if (next !== null) send({ type: 'FOCUS', value: next, focus: true });
          };
          const nextBar = (intent: 'next' | 'previous') => {
            const next = getNavigationTarget(
              props.items.map((entry) => ({ ...entry, disabled: false })),
              path[0]!.value,
              intent,
              props.loop ?? true,
            );
            if (next !== null) {
              send({ type: 'FOCUS', value: next, focus: true });
              send({ type: 'OPEN_SUB', value: next });
            }
          };
          if (event.key === 'Home' || event.key === 'End') move(event.key === 'Home' ? 'first' : 'last');
          else if (event.key === 'Enter' || event.key === ' ') send({ type: 'ACTIVATE', value: item.value });
          else if (event.key === 'Escape') {
            if (context.openPath.length) send({ type: 'BACK' });
            else send({ type: 'CLOSE', reason: 'escape' });
          } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            if (bar && root) send({ type: 'OPEN_SUB', value: item.value, last: event.key === 'ArrowUp' });
            else move(event.key === 'ArrowDown' ? 'next' : 'previous');
          } else if (event.key === forward) {
            if (bar && root) {
              if (context.openPath.length) nextBar('next');
              else move('next');
            } else if (item.children) send({ type: 'OPEN_SUB', value: item.value });
            else if (bar) nextBar('next');
          } else if (event.key === backward) {
            if (bar && root) {
              if (context.openPath.length) nextBar('previous');
              else move('previous');
            } else if (bar && path.length === 2) nextBar('previous');
            else send({ type: 'BACK' });
          }
        },
      ],
    },
    TYPE: {
      target: 'searching',
      reenter: true,
      guard: ({ props, context }) => menuOpen(props, context),
      assign: ({ context, event }) => ({ query: context.query + event.character }),
      actions: [
        ({ props, context, send }) => {
          const path = menuPath(props.items, context.activeValue);
          const level = path.length > 1 ? path.at(-2)!.children! : props.items;
          const next = getTypeaheadTarget(
            level.map((item) => ({ ...item, disabled: false })),
            context.activeValue,
            context.query,
          );
          if (next) send({ type: 'FOCUS', value: next, focus: true });
        },
      ],
    },
    CLEAR_SEARCH: { target: 'idle', assign: () => ({ query: '' }) },
    CHECK: {
      guard: ({ props, context, event }) => {
        const item = menuPath(props.items, event.value).at(-1);
        return (
          menuOpen(props, context) &&
          !!item &&
          !item.disabled &&
          (item.type === 'checkbox' || (item.type === 'radio' && !menuChecked(props, context).includes(event.value)))
        );
      },
      assign: ({ props, context, event }) => ({
        checkedValues:
          props.checkedValues === undefined ? nextChecked(props, context, event.value) : context.checkedValues,
      }),
      actions: [
        ({ props, context, event }) =>
          props.onCheckedValuesChange?.(
            props.checkedValues === undefined ? [...context.checkedValues] : nextChecked(props, context, event.value),
          ),
      ],
    },
    ACTIVATE: {
      guard: ({ props, context, event }) =>
        menuOpen(props, context) &&
        menuPath(props.items, event.value).length > 0 &&
        !menuPath(props.items, event.value).some((item) => item.disabled),
      actions: [
        ({ props, event, send }) => {
          const item = menuPath(props.items, event.value).at(-1)!;
          if (item.children) {
            send({ type: 'OPEN_SUB', value: item.value });
            return;
          }
          send({ type: 'CHECK', value: item.value });
          props.onSelect?.(item.value);
          if (item.closeOnSelect ?? (item.type === undefined || item.type === 'item'))
            send({ type: 'CLOSE', reason: 'select' });
        },
      ],
    },
    CLOSE: {
      target: 'idle',
      guard: ({ props, context }) => menuOpen(props, context),
      assign: ({ props, context, event }) => ({
        open: props.open === undefined && props.kind !== 'menubar' ? false : context.open,
        openPath: [],
        query: '',
        activeValue: menuPath(props.items, context.activeValue)[0]?.value ?? props.items[0]?.value ?? null,
        closeReason: event.reason,
        recoverFocus: false,
        focusVersion:
          context.focusVersion +
          (props.kind === 'menubar' && (event.reason === 'escape' || event.reason === 'select') ? 1 : 0),
      }),
      actions: [
        ({ props, event }) => {
          if (props.kind !== 'menubar') props.onOpenChange?.(false);
          props.onClose?.(event.reason);
        },
      ],
    },
  },
});
