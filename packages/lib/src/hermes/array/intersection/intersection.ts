export const intersection = <T>(a: T[], b: T[]): T[] => {
  // b는 포함 검사용, seen은 중복 제거용. 순서는 a를 한 번 훑으며 결정한다.
  const include = new Set(b);
  const seen = new Set<T>();
  const result: T[] = [];

  for (const value of a) {
    if (include.has(value) && !seen.has(value)) {
      seen.add(value);
      result.push(value);
    }
  }

  return result;
};
