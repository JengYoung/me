import { type TypeofResult, getType } from "../../type/get-type/index";

export const filterObject = (obj: Record<string, unknown>, filterTypes: Set<TypeofResult>) => {
  const entries = Object.entries(obj).filter(([key, value]) => {
    const type = getType(value);

    return !filterTypes.has(type);
  });

  return Object.fromEntries(entries);
};
