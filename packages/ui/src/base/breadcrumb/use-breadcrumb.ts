'use client';
import { useStableId } from "../_shared/react/index";
import { connectBreadcrumb } from "./breadcrumb.connect";
export interface BreadcrumbOptions {
  id?: string;
}
export function useBreadcrumb(options: BreadcrumbOptions = {}) {
  return connectBreadcrumb(useStableId('iris-breadcrumb', options.id));
}
export type { BreadcrumbApi, BreadcrumbLinkProps } from "./breadcrumb.connect";
