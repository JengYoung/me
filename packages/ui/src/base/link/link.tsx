'use client';
import type { PartProps } from "../_shared/react/index";
import { useLink } from "./use-link";
import type { LinkOptions } from "./use-link";
export type LinkProps = PartProps<'a'> & LinkOptions;
export function Link({ href, current, id, ...props }: LinkProps) {
  return <a {...useLink({ href, current, id }).getRootProps(props)}>{props.children}</a>;
}
