export const buildZArray = (value: string) => {
  const z = Array(value.length).fill(0);
  let left = 0;
  let right = 0;

  for (let index = 1; index < value.length; index += 1) {
    if (index <= right) {
      z[index] = Math.min(right - index + 1, z[index - left]);
    }

    while (index + z[index] < value.length && value[z[index]] === value[index + z[index]]) {
      z[index] += 1;
    }

    if (index + z[index] - 1 > right) {
      left = index;
      right = index + z[index] - 1;
    }
  }

  return z;
};

export const zSearch = (text: string, pattern: string) => {
  if (!pattern.length) {
    return Array.from({ length: text.length + 1 }, (_, index) => index);
  }

  const separator = "\0";
  const z = buildZArray(`${pattern}${separator}${text}`);
  const result: number[] = [];
  const offset = pattern.length + 1;

  for (let index = offset; index < z.length; index += 1) {
    if (z[index] >= pattern.length) {
      result.push(index - offset);
    }
  }

  return result;
};
