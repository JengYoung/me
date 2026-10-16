import { qrcodegen } from './vendor/qrcodegen';
export type QrErrorCorrection = 'L' | 'M' | 'Q' | 'H';
export interface QrEncodeOptions {
  errorCorrection?: QrErrorCorrection;
  margin?: number;
  maxVersion?: number;
}
export interface QrMatrix {
  size: number;
  modules: readonly (readonly boolean[])[];
}
/** Pure synchronous encoder adapter; no DOM, requests or instance state. */
export type QrEncoder = (
  value: string,
  options: { errorCorrection: QrErrorCorrection; maxVersion: number },
) => QrMatrix;
export class QrCodeError extends Error {
  constructor(
    public readonly reason: 'capacity' | 'invalid-options' | 'encoding',
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'QrCodeError';
  }
}
export const defaultQrEncoder: QrEncoder = (value, options) => {
  const { QrCode, QrSegment } = qrcodegen;
  const levels = { L: QrCode.Ecc.LOW, M: QrCode.Ecc.MEDIUM, Q: QrCode.Ecc.QUARTILE, H: QrCode.Ecc.HIGH };
  const segments = QrSegment.makeSegments(value);
  // Explicit UTF-8 ECI makes non-ASCII text portable across scanners.
  if (Array.from(value).some((character) => character.codePointAt(0)! > 127)) segments.unshift(QrSegment.makeEci(26));
  const qr = QrCode.encodeSegments(segments, levels[options.errorCorrection], 1, options.maxVersion, -1, false);
  return {
    size: qr.size,
    modules: Array.from({ length: qr.size }, (_, y) => Array.from({ length: qr.size }, (_, x) => qr.getModule(x, y))),
  };
};
export function encodeQr(value: string, options: QrEncodeOptions = {}, encoder: QrEncoder = defaultQrEncoder) {
  const { errorCorrection = 'M', margin = 4, maxVersion = 40 } = options;
  if (
    !['L', 'M', 'Q', 'H'].includes(errorCorrection) ||
    !Number.isInteger(margin) ||
    margin < 0 ||
    margin > 64 ||
    !Number.isInteger(maxVersion) ||
    maxVersion < 1 ||
    maxVersion > 40
  )
    throw new QrCodeError('invalid-options', 'Invalid QR options.');
  try {
    const result = encoder(value, { errorCorrection, maxVersion });
    if (
      !Number.isInteger(result.size) ||
      result.size < 21 ||
      result.size > maxVersion * 4 + 17 ||
      (result.size - 17) % 4 !== 0 ||
      result.modules.length !== result.size ||
      result.modules.some((row) => row.length !== result.size || row.some((cell) => typeof cell !== 'boolean'))
    )
      throw new Error('Encoder returned an invalid QR matrix.');
    const modules = result.modules.map((row) => [...row]);
    const path = modules
      .flatMap((row, y) => row.flatMap((dark, x) => (dark ? [`M${x + margin} ${y + margin}h1v1h-1z`] : [])))
      .join('');
    const dimension = result.size + margin * 2;
    return {
      modules,
      size: result.size,
      version: (result.size - 17) / 4,
      margin,
      dimension,
      path,
      viewBox: `0 0 ${dimension} ${dimension}`,
      errorCorrection,
    };
  } catch (cause) {
    if (cause instanceof QrCodeError) throw cause;
    throw new QrCodeError(
      cause instanceof RangeError && cause.message === 'Data too long' ? 'capacity' : 'encoding',
      cause instanceof Error ? cause.message : 'QR encoding failed.',
      { cause },
    );
  }
}
export type QrCodeData = ReturnType<typeof encodeQr>;
