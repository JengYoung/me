export const sumBy = <T>(array: T[], valueFn: (item: T) => number): number => {
  let total = 0;

  for (const item of array) {
    total += valueFn(item);
  }

  return total;
};
