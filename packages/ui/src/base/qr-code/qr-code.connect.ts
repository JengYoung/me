import { mergeProps } from "../_shared/react/index";
import type { MachineApi, PartProps } from "../_shared/react/index";
import type { QrCodeSchema } from "./qr-code.machine";
import type { QrCodeData } from "./qr-encoder";
import type { QrCodeOptions, QrDownloadOptions } from "./use-qr-code";
import type { QrExportOptions } from "./qr-export";
export function connectQrCode(
  machine: MachineApi<QrCodeSchema>,
  options: QrCodeOptions & { id: string },
  encoding: { data: QrCodeData | null; error: unknown },
  actions: {
    exportImage(options?: QrExportOptions): Promise<Blob>;
    download(options?: QrDownloadOptions): Promise<void>;
  },
) {
  const data = (part: string) => ({
    'data-scope': 'qr-code',
    'data-part': part,
    'data-state': encoding.error ? 'invalid' : machine.state.value,
  });
  return {
    data: encoding.data,
    encodingError: encoding.error,
    state: encoding.error ? 'invalid' : machine.state.value,
    error: machine.state.context.error,
    value: options.value,
    ...actions,
    cancel: () => machine.send({ type: 'CANCEL' }),
    getSvgProps: (user: PartProps<'svg'> = {}) =>
      mergeProps<'svg'>(user, {
        ...data('svg'),
        id: options.id,
        role: 'img',
        'aria-label': user['aria-label'] ?? options.label ?? 'QR code',
        viewBox: encoding.data?.viewBox ?? '0 0 1 1',
        'aria-busy': machine.state.value === 'exporting',
      }),
    getPatternProps: (user: PartProps<'path'> = {}) =>
      mergeProps<'path'>(user, {
        ...data('pattern'),
        d: encoding.data?.path ?? '',
        fill: user.fill ?? 'currentColor',
        shapeRendering: 'crispEdges',
      }),
    getBackgroundProps: (user: PartProps<'rect'> = {}) =>
      mergeProps<'rect'>(user, { ...data('background'), width: '100%', height: '100%', fill: user.fill ?? 'white' }),
    getTextProps: (user: PartProps<'span'> = {}) =>
      mergeProps<'span'>(user, { ...data('text'), children: user.children ?? options.value }),
    getDownloadProps(settings: QrDownloadOptions = {}, user: PartProps<'button'> = {}): PartProps<'button'> {
      return mergeProps<'button'>(user, {
        ...data('download'),
        type: 'button',
        disabled: !!options.disabled || !!encoding.error || !!user.disabled,
        'aria-busy': machine.state.value === 'exporting',
        onClick: () => {
          if (!user.disabled) void actions.download(settings).catch(() => {});
        },
      });
    },
  };
}
export type QrCodeApi = ReturnType<typeof connectQrCode>;
