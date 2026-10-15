'use client';
import { useState } from 'react';
import { useMachine, useStableId } from "../_shared/react/index";
import { paginationMachine, validatePagination } from "./pagination.machine";
import type { PaginationOptions } from "./pagination.machine";
import { connectPagination } from "./pagination.connect";
export function usePagination(options: PaginationOptions) {
  validatePagination(options);
  const [controlled] = useState(options.page !== undefined);
  const id = useStableId('iris-pagination', options.id);
  const service = useMachine(paginationMachine, { props: options });
  if (controlled !== (options.page !== undefined)) throw new Error('Pagination cannot switch control modes.');
  return connectPagination(service, { ...options, id });
}
export type { PaginationOptions, PaginationItem, PaginationTarget } from "./pagination.machine";
export type { PaginationApi } from "./pagination.connect";
