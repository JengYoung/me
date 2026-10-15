'use client';
import { useMemo, useRef } from 'react';
import { useMachine, useStableId } from "../_shared/react/index";
import { encodeQr } from "./qr-encoder";
import type { QrEncodeOptions, QrEncoder } from "./qr-encoder";
import { downloadQrBlob, exportQr, qrExportOptions } from "./qr-export";
import type { QrExportAdapter, QrExportOptions } from "./qr-export";
import { qrCodeMachine } from "./qr-code.machine";
import { connectQrCode } from "./qr-code.connect";
export interface QrCodeOptions extends QrEncodeOptions {
  value: string;
  label?: string;
  id?: string;
  encoder?: QrEncoder;
  disabled?: boolean;
  exportAdapter?: QrExportAdapter;
  onExportError?: (error: unknown) => void;
}
export interface QrDownloadOptions extends QrExportOptions {
  filename?: string;
}
export function useQrCode(options: QrCodeOptions) {
  const { value, errorCorrection, margin, maxVersion, encoder } = options;
  const encoding = useMemo(() => {
    try {
      return { data: encodeQr(value, { errorCorrection, margin, maxVersion }, encoder), error: null };
    } catch (error) {
      return { data: null, error };
    }
  }, [value, errorCorrection, margin, maxVersion, encoder]);
  const id = useStableId('iris-qr-code', options.id);
  const pending = useRef<{ resolve(blob: Blob): void; reject(error: unknown): void } | null>(null);
  const service = useMachine(qrCodeMachine, {
    props: {
      key: JSON.stringify([value, errorCorrection, margin, maxVersion]),
      encoder,
      disabled: options.disabled,
      valid: !!encoding.data,
      onExportError: options.onExportError,
      performExport: async (settings, signal) => {
        const request = pending.current;
        pending.current = null;
        const abort = () => request?.reject(signal.reason);
        signal.addEventListener('abort', abort, { once: true });
        try {
          const blob = await (options.exportAdapter ?? exportQr)({
            data: encoding.data!,
            format: settings.format,
            size: settings.size,
            label: options.label ?? 'QR code',
            signal,
          });
          signal.throwIfAborted();
          if (settings.filename !== undefined) await downloadQrBlob(blob, settings.filename, signal);
          signal.throwIfAborted();
          request?.resolve(blob);
        } catch (error) {
          request?.reject(error);
          throw error;
        } finally {
          signal.removeEventListener('abort', abort);
        }
      },
    },
  });
  const { send, getProps, getSnapshot } = service;
  const run = (settings: QrExportOptions = {}, filename?: string): Promise<Blob> => {
    if (getProps().disabled || !getProps().valid || getSnapshot().status !== 'active')
      return Promise.reject(new Error('QR Code is not ready.'));
    let normalized: Required<QrExportOptions>;
    try {
      normalized = qrExportOptions(settings);
    } catch (error) {
      return Promise.reject(error);
    }
    return new Promise((resolve, reject) => {
      pending.current = { resolve, reject };
      send({ type: 'EXPORT', options: { ...normalized, filename } });
    });
  };
  // connect only returns deferred export/download commands; it does not run them during render.
  // oxlint-disable-next-line react/refs
  return connectQrCode(service, { ...options, id }, encoding, {
    exportImage: (settings?: QrExportOptions) => run(settings),
    download: async (settings: QrDownloadOptions = {}) => {
      await run(settings, settings.filename ?? `qr-code.${settings.format ?? 'svg'}`);
    },
  });
}
export type { QrCodeApi } from "./qr-code.connect";
