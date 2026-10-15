'use client';
import type { PartProps } from "../_shared/react/index";
import { useAlert } from "./use-alert";
import type { AlertOptions } from "./use-alert";

export type AlertProps = PartProps<'div'> & AlertOptions;
export function Alert({ id, ...props }: AlertProps) {
  return <div {...useAlert({ id }).getRootProps(props)} />;
}
