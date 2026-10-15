'use client';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from "../_shared/react/index";
import { useOtpInput } from "./use-otp-input";
import type { OtpInputApi, OtpInputInputProps, OtpInputOptions } from "./use-otp-input";

const Context = createContext<OtpInputApi | null>(null);
function useOtpInputContext() {
  const api = useContext(Context);
  if (!api) throw new Error('OTP Input parts must be rendered inside OtpInput.Root.');
  return api;
}
export function OtpInputRoot({
  children,
  rootProps,
  ...options
}: OtpInputOptions & { children?: ReactNode; rootProps?: PartProps<'div'> }) {
  const api = useOtpInput(options);
  return (
    <Context value={api}>
      <div {...api.getRootProps(rootProps)}>{children}</div>
    </Context>
  );
}
export function OtpInputInput(props: OtpInputInputProps) {
  return <input {...useOtpInputContext().getInputProps(props)} />;
}
export function OtpInputSlot({ index, children, ...props }: PartProps<'span'> & { index: number }) {
  const api = useOtpInputContext();
  return <span {...api.getSlotProps(index, props)}>{children ?? api.slots[index]?.character}</span>;
}
export function OtpInputLabel(props: PartProps<'label'>) {
  // oxlint-disable-next-line jsx-a11y/label-has-associated-control -- Getter supplies the native input ID.
  return <label {...useOtpInputContext().getLabelProps(props)} />;
}
export function OtpInputDescription(props: PartProps<'span'>) {
  return <span {...useOtpInputContext().getDescriptionProps(props)} />;
}
export function OtpInputError(props: PartProps<'span'>) {
  return <span {...useOtpInputContext().getErrorProps(props)} />;
}
export const OtpInput = {
  Root: OtpInputRoot,
  Input: OtpInputInput,
  Slot: OtpInputSlot,
  Label: OtpInputLabel,
  Description: OtpInputDescription,
  Error: OtpInputError,
};
