import { createMachine } from '../_shared/core/index';
import type { MachineArgs } from '../_shared/core/index';
import { constrainPanel, panelBounds, validatePanelGeometry } from './geometry';
import type { PanelConstraints, PanelPoint, PanelRect, PanelSize } from './geometry';

export type FloatingPanelMode = 'normal' | 'minimized' | 'maximized';
export interface FloatingPanelStateOptions extends PanelConstraints {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  position?: PanelPoint;
  defaultPosition?: PanelPoint;
  onPositionChange?: (position: PanelPoint) => void;
  size?: PanelSize;
  defaultSize?: PanelSize;
  onSizeChange?: (size: PanelSize) => void;
  mode?: FloatingPanelMode;
  defaultMode?: FloatingPanelMode;
  onModeChange?: (mode: FloatingPanelMode) => void;
  minimizedHeight?: number;
  draggable?: boolean;
  resizable?: boolean;
  disabled?: boolean;
  keyboardStep?: number;
}
interface PanelChange {
  open?: boolean;
  mode?: FloatingPanelMode;
  position?: PanelPoint;
  size?: PanelSize;
}
export interface FloatingPanelSchema {
  state: 'idle' | 'dragging' | 'resizing';
  props: FloatingPanelStateOptions;
  context: {
    open: boolean;
    mode: FloatingPanelMode;
    position: PanelPoint;
    size: PanelSize;
    viewport: PanelRect | null;
    change: PanelChange;
  };
  event:
    | { type: 'OPEN'; open: boolean }
    | { type: 'MODE'; mode: FloatingPanelMode }
    | { type: 'RECT'; position?: PanelPoint; size?: PanelSize }
    | { type: 'VIEWPORT'; viewport: PanelRect }
    | { type: 'START'; interaction: 'dragging' | 'resizing' }
    | { type: 'END' };
}
export const panelOpen = (props: FloatingPanelStateOptions, context: FloatingPanelSchema['context']) =>
  props.open ?? context.open;
export const panelMode = (props: FloatingPanelStateOptions, context: FloatingPanelSchema['context']) =>
  props.mode ?? context.mode;
export function panelNormalRect(props: FloatingPanelStateOptions, context: FloatingPanelSchema['context']) {
  return constrainPanel(
    { ...(props.position ?? context.position), ...(props.size ?? context.size) },
    props,
    panelBounds(props, context.viewport),
  );
}
export function panelDisplayRect(props: FloatingPanelStateOptions, context: FloatingPanelSchema['context']) {
  const normal = panelNormalRect(props, context);
  const bounds = panelBounds(props, context.viewport);
  const mode = panelMode(props, context);
  if (mode === 'maximized' && bounds) return bounds;
  if (mode === 'minimized') {
    const height = Math.min(props.minimizedHeight ?? 48, bounds?.height ?? Infinity);
    return { ...normal, height, y: bounds ? Math.min(normal.y, bounds.y + bounds.height - height) : normal.y };
  }
  return normal;
}
export function validateFloatingPanel(props: FloatingPanelStateOptions) {
  validatePanelGeometry(props);
  for (const value of [props.keyboardStep, props.minimizedHeight])
    if (value !== undefined && (!Number.isFinite(value) || value <= 0))
      throw new Error('Floating Panel distances must be finite and positive.');
  for (const mode of [props.mode, props.defaultMode])
    if (mode !== undefined && !['normal', 'minimized', 'maximized'].includes(mode))
      throw new Error('Invalid Floating Panel mode.');
}
function rectChange(
  props: FloatingPanelStateOptions,
  context: FloatingPanelSchema['context'],
  update: { position?: PanelPoint; size?: PanelSize },
  viewport = context.viewport,
) {
  const position = props.position ?? context.position;
  const size = props.size ?? context.size;
  const next = constrainPanel(
    { ...(update.position ?? position), ...(update.size ?? size) },
    props,
    panelBounds(props, viewport),
  );
  const nextPosition = { x: next.x, y: next.y };
  const nextSize = { width: next.width, height: next.height };
  return {
    viewport,
    position: props.position === undefined ? nextPosition : context.position,
    size: props.size === undefined ? nextSize : context.size,
    change: {
      ...(position.x !== next.x || position.y !== next.y ? { position: nextPosition } : {}),
      ...(size.width !== next.width || size.height !== next.height ? { size: nextSize } : {}),
    },
  };
}
const notify = ({ props, context }: MachineArgs<FloatingPanelSchema>) => {
  const change = context.change;
  if (change.open !== undefined) props.onOpenChange?.(change.open);
  if (change.mode !== undefined) props.onModeChange?.(change.mode);
  if (change.position) props.onPositionChange?.(change.position);
  if (change.size) props.onSizeChange?.(change.size);
};
export const floatingPanelMachine = createMachine<FloatingPanelSchema>({
  initial: 'idle',
  context: ({ props }) => {
    validateFloatingPanel(props);
    return {
      open: props.defaultOpen ?? false,
      mode: props.defaultMode ?? 'normal',
      position: { ...(props.defaultPosition ?? { x: 24, y: 24 }) },
      size: { ...(props.defaultSize ?? { width: 360, height: 260 }) },
      viewport: null,
      change: {},
    };
  },
  states: { idle: {}, dragging: {}, resizing: {} },
  onProps: {
    guard: ({ props, context, value }) =>
      !panelOpen(props, context) ||
      props.disabled === true ||
      panelMode(props, context) !== 'normal' ||
      (value === 'dragging' && props.draggable === false) ||
      (value === 'resizing' && props.resizable === false),
    target: 'idle',
  },
  on: {
    OPEN: {
      target: 'idle',
      assign: ({ props, context, event }) => ({
        open: props.open === undefined ? event.open : context.open,
        change: panelOpen(props, context) === event.open ? {} : { open: event.open },
      }),
      actions: [notify],
    },
    MODE: {
      target: 'idle',
      assign: ({ props, context, event }) => ({
        mode: props.mode === undefined ? event.mode : context.mode,
        change: panelMode(props, context) === event.mode ? {} : { mode: event.mode },
      }),
      actions: [notify],
    },
    RECT: {
      guard: ({ event }) =>
        [event.position?.x, event.position?.y, event.size?.width, event.size?.height].every(
          (value) => value === undefined || Number.isFinite(value),
        ),
      assign: ({ props, context, event }) => rectChange(props, context, event),
      actions: [notify],
    },
    VIEWPORT: {
      assign: ({ props, context, event }) => rectChange(props, context, {}, event.viewport),
      actions: [notify],
    },
    START: [
      {
        guard: ({ props, context, event }) =>
          panelOpen(props, context) &&
          !props.disabled &&
          panelMode(props, context) === 'normal' &&
          event.interaction === 'dragging' &&
          props.draggable !== false,
        target: 'dragging',
      },
      {
        guard: ({ props, context, event }) =>
          panelOpen(props, context) &&
          !props.disabled &&
          panelMode(props, context) === 'normal' &&
          event.interaction === 'resizing' &&
          props.resizable !== false,
        target: 'resizing',
      },
    ],
    END: { target: 'idle' },
  },
});
