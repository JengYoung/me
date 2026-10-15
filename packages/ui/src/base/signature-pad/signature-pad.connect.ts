import { mergeProps } from "../_shared/react/index";
import type { MachineApi, PartProps, usePointerDrag } from "../_shared/react/index";
import { signatureValue } from "./signature-pad.machine";
import type {
  SignatureExportOptions,
  SignaturePadSchema,
  SignaturePoint,
  SignatureValue,
} from "./signature-pad.machine";
import type { SignaturePadOptions } from "./use-signature-pad";
import { signaturePath } from "./signature-renderer";
export function connectSignaturePad(
  machine: MachineApi<SignaturePadSchema>,
  options: SignaturePadOptions & { id: string },
  drag: ReturnType<typeof usePointerDrag>,
  exportImage: (options?: SignatureExportOptions) => Promise<Blob>,
) {
  const { state, send } = machine;
  const value = signatureValue(options, state.context);
  const strokes = state.value === 'drawing' ? [...value, state.context.draft] : value;
  const data = (part: string) => ({
    'data-scope': 'signature-pad',
    'data-part': part,
    'data-state': state.value,
    'data-disabled': options.disabled ? '' : undefined,
  });
  const clear = () => send({ type: 'CLEAR' });
  return {
    value,
    strokes,
    empty: !value.some((stroke) => stroke.length),
    drawing: state.value === 'drawing',
    state: state.value,
    error: state.context.error,
    path: signaturePath(strokes),
    clear,
    cancel: () => send({ type: 'CANCEL' }),
    start: (point: SignaturePoint) => send({ type: 'START', point }),
    move: (point: SignaturePoint) => send({ type: 'MOVE', point }),
    end: () => send({ type: 'END' }),
    setValue: (next: SignatureValue) => send({ type: 'SET', value: next }),
    exportImage,
    getSurfaceProps(user: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(user, {
        ...data('surface'),
        ...drag,
        id: options.id,
        role: 'group',
        tabIndex: options.disabled ? -1 : 0,
        'aria-disabled': !!options.disabled,
        'aria-busy': state.value === 'exporting',
      });
    },
    getClearProps(user: PartProps<'button'> = {}): PartProps<'button'> {
      return mergeProps<'button'>(user, {
        ...data('clear'),
        type: 'button',
        disabled: !!options.disabled || !!user.disabled,
        onClick: () => {
          if (!user.disabled) clear();
        },
      });
    },
    getExportProps(settings: SignatureExportOptions = {}, user: PartProps<'button'> = {}): PartProps<'button'> {
      return mergeProps<'button'>(user, {
        ...data('export'),
        type: 'button',
        disabled: !!options.disabled || !!user.disabled,
        'aria-busy': state.value === 'exporting',
        onClick: () => {
          if (!user.disabled) void exportImage(settings).catch(() => {});
        },
      });
    },
  };
}
export type SignaturePadApi = ReturnType<typeof connectSignaturePad>;
