'use client';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from '../_shared/react/index';
import { useQrCode } from './use-qr-code';
import type { QrCodeApi, QrCodeOptions, QrDownloadOptions } from './use-qr-code';
const Context = createContext<QrCodeApi | null>(null);
function useQrCodeContext() {
  const api = useContext(Context);
  if (!api) throw new Error('QR Code parts must be inside QrCode.Root.');
  return api;
}
export type QrCodeRootProps = QrCodeOptions & { children?: ReactNode };
export function QrCodeRoot({ children, ...options }: QrCodeRootProps) {
  return <Context value={useQrCode(options)}>{children}</Context>;
}
export function QrCodeSvg(props: PartProps<'svg'>) {
  return <svg {...useQrCodeContext().getSvgProps(props)} />;
}
export function QrCodePattern(props: PartProps<'path'>) {
  return <path {...useQrCodeContext().getPatternProps(props)} />;
}
export function QrCodeBackground(props: PartProps<'rect'>) {
  return <rect {...useQrCodeContext().getBackgroundProps(props)} />;
}
export function QrCodeText(props: PartProps<'span'>) {
  return <span {...useQrCodeContext().getTextProps(props)} />;
}
export function QrCodeDownload({ options, ...props }: PartProps<'button'> & { options?: QrDownloadOptions }) {
  return <button {...useQrCodeContext().getDownloadProps(options, props)} />;
}
export function QrCodeValue({ children }: { children: (api: QrCodeApi) => ReactNode }) {
  return children(useQrCodeContext());
}
export const QrCode = {
  Root: QrCodeRoot,
  Svg: QrCodeSvg,
  Pattern: QrCodePattern,
  Background: QrCodeBackground,
  Text: QrCodeText,
  Download: QrCodeDownload,
  Value: QrCodeValue,
};
