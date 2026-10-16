'use client';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from '../_shared/react/index';
import { useSignaturePad } from './use-signature-pad';
import type { SignaturePadApi, SignaturePadOptions } from './use-signature-pad';
import type { SignatureExportOptions } from './signature-pad.machine';
const Context = createContext<SignaturePadApi | null>(null);
function useSignaturePadContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Signature Pad parts must be inside SignaturePad.Root.');
  return api;
}
export type SignaturePadRootProps = SignaturePadOptions & { children?: ReactNode };
export function SignaturePadRoot({ children, ...options }: SignaturePadRootProps) {
  return <Context value={useSignaturePad(options)}>{children}</Context>;
}
export function SignaturePadSurface(props: PartProps<'div'>) {
  return <div {...useSignaturePadContext().getSurfaceProps(props)} />;
}
export function SignaturePadClear(props: PartProps<'button'>) {
  return <button {...useSignaturePadContext().getClearProps(props)} />;
}
export function SignaturePadExport({ options, ...props }: PartProps<'button'> & { options?: SignatureExportOptions }) {
  return <button {...useSignaturePadContext().getExportProps(options, props)} />;
}
export function SignaturePadValue({ children }: { children: (api: SignaturePadApi) => ReactNode }) {
  return children(useSignaturePadContext());
}
export const SignaturePad = {
  Root: SignaturePadRoot,
  Surface: SignaturePadSurface,
  Clear: SignaturePadClear,
  Export: SignaturePadExport,
  Value: SignaturePadValue,
};
