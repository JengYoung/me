export const minBy = <T>(array: T[], valueFn: (item: T) => number): T | null => {
  if (array.length === 0) {
    return null;
  }

  let best = array[0];
  let bestValue = valueFn(best);

  for (let index = 1; index < array.length; index += 1) {
    const item = array[index];
    const value = valueFn(item);

    if (value < bestValue) {
      best = item;
      bestValue = value;
    }
  }

  return best;
};
