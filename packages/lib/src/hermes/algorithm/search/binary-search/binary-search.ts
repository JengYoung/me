const defaultCompare = <T>(value: T, target: T) => {
  if (value < target) {
    return -1;
  }

  if (value > target) {
    return 1;
  }

  return 0;
};

export const lowerBound = <T>(values: T[], target: T, compare = defaultCompare<T>) => {
  let left = 0;
  let right = values.length;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);

    if (compare(values[mid], target) < 0) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  return left;
};

export const upperBound = <T>(values: T[], target: T, compare = defaultCompare<T>) => {
  let left = 0;
  let right = values.length;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);

    if (compare(values[mid], target) <= 0) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  return left;
};

export const binarySearch = <T>(values: T[], target: T, compare = defaultCompare<T>) => {
  const index = lowerBound(values, target, compare);

  if (index >= values.length || compare(values[index], target) !== 0) {
    return -1;
  }

  return index;
};

export const binarySearchAnswer = (left: number, right: number, canUse: (value: number) => boolean) => {
  let low = left;
  let high = right;
  let answer = right + 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    if (canUse(mid)) {
      answer = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return answer;
};
