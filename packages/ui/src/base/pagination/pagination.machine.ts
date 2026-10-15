import { createMachine } from "../_shared/core/index";
import type { MachineArgs } from "../_shared/core/index";

export interface PaginationOptions {
  count: number;
  pageSize?: number;
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  boundaryCount?: number;
  siblingCount?: number;
  disabled?: boolean;
  id?: string;
}
export type PaginationTarget = number | 'first' | 'previous' | 'next' | 'last';
export type PaginationItem = { type: 'page'; value: number } | { type: 'ellipsis'; key: 'start' | 'end' };
export interface PaginationSchema {
  state: 'idle';
  context: { page: number };
  props: PaginationOptions;
  event: { type: 'GO'; target: PaginationTarget };
}
export function validatePagination(props: PaginationOptions) {
  for (const [name, value, min] of [
    ['count', props.count, 0],
    ['pageSize', props.pageSize ?? 10, 1],
    ['boundaryCount', props.boundaryCount ?? 1, 0],
    ['siblingCount', props.siblingCount ?? 1, 0],
    ['page', props.page ?? 1, 1],
    ['defaultPage', props.defaultPage ?? 1, 1],
  ] as const)
    if (!Number.isSafeInteger(value) || value < min)
      throw new Error(`Pagination ${name} must be a safe integer >= ${min}.`);
}
export const paginationPageCount = (props: PaginationOptions) => Math.ceil(props.count / (props.pageSize ?? 10));
export const clampPage = (props: PaginationOptions, page: number) =>
  Math.max(1, Math.min(Math.max(1, paginationPageCount(props)), page));
export const paginationPage = (props: PaginationOptions, context: Readonly<PaginationSchema['context']>) =>
  clampPage(props, props.page ?? context.page);
export function targetPage(props: PaginationOptions, page: number, target: PaginationTarget) {
  if (typeof target === 'number') return target;
  return target === 'first'
    ? 1
    : target === 'last'
      ? Math.max(1, paginationPageCount(props))
      : page + (target === 'next' ? 1 : -1);
}
function requested({ props, context, event }: MachineArgs<PaginationSchema, PaginationSchema['event']>) {
  return clampPage(props, targetPage(props, paginationPage(props, context), event.target));
}
/** Work scales with the visible window, not the total page count. Single-page gaps stay numbered. */
export function paginationItems(total: number, page: number, boundary: number, siblings: number): PaginationItem[] {
  const visible = new Set<number>();
  const add = (start: number, end: number) => {
    for (let value = Math.max(1, start); value <= Math.min(total, end); value++) visible.add(value);
  };
  add(1, boundary);
  add(page - siblings, page + siblings);
  add(total - boundary + 1, total);
  const pages = [...visible].sort((a, b) => a - b);
  const result: PaginationItem[] = [];
  if (pages[0] === 2) result.push({ type: 'page', value: 1 });
  else if (pages[0] !== undefined && pages[0] > 2) result.push({ type: 'ellipsis', key: 'start' });
  let previous: number | undefined;
  for (const value of pages) {
    if (previous !== undefined && value - previous === 2) result.push({ type: 'page', value: previous + 1 });
    else if (previous !== undefined && value - previous > 2)
      result.push({ type: 'ellipsis', key: value <= page ? 'start' : 'end' });
    result.push({ type: 'page', value });
    previous = value;
  }
  if (previous !== undefined && previous === total - 1) result.push({ type: 'page', value: total });
  else if (previous !== undefined && previous < total - 1) result.push({ type: 'ellipsis', key: 'end' });
  return result;
}
export const paginationMachine = createMachine<PaginationSchema>({
  initial: 'idle',
  context: ({ props }) => {
    validatePagination(props);
    return { page: props.page !== undefined ? 1 : clampPage(props, props.defaultPage ?? 1) };
  },
  states: { idle: {} },
  onProps: {
    guard: ({ props, context }) => props.page === undefined && context.page !== clampPage(props, context.page),
    assign: ({ props, context }) => ({ page: clampPage(props, context.page) }),
    actions: [({ props, context }) => props.onPageChange?.(context.page)],
  },
  on: {
    GO: {
      guard: (args) =>
        !args.props.disabled &&
        (typeof args.event.target !== 'number' || Number.isSafeInteger(args.event.target)) &&
        paginationPageCount(args.props) > 0 &&
        requested(args) !== paginationPage(args.props, args.context),
      assign: (args) => ({ page: args.props.page !== undefined ? args.context.page : requested(args) }),
      actions: [
        ({ props, context, event }) =>
          props.onPageChange?.(
            props.page !== undefined ? requested({ props, context, event, value: 'idle' }) : context.page,
          ),
      ],
    },
  },
});
