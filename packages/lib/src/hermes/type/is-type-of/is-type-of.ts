import { type TypeofResult, getType } from "../get-type/index";

export const isTypeOf = (
  target: unknown,
  expectedType: TypeofResult,
  options?: {
    debug?: boolean;
    onDebug?: (param: {
      expectedType: TypeofResult;
      nowType: TypeofResult;
    }) => void;
  },
) => {
  const nowType = getType(target);

  const result = nowType === expectedType;

  if (options?.debug) {
    if (!result) {
      console.info({ expectedType, nowType });
      options?.onDebug?.({ expectedType, nowType });
    }
  }

  return nowType === expectedType;
};
