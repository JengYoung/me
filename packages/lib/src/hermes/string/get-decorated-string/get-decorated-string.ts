const selection = "___FORMAT___";

export const getDecoratedString = (target: string, toBe: string) => {
  return toBe.replace(new RegExp(selection, "g"), target);
};

getDecoratedString.selection = selection;
