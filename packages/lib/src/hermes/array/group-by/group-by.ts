// 배열 항목을 keyFn이 돌려주는 키로 묶는다. 같은 키의 항목들은 등장 순서대로
// 한 배열에 모인다. 입력 배열은 변형하지 않고 새 객체를 반환한다.
export const groupBy = <T, K extends PropertyKey>(array: readonly T[], keyFn: (item: T) => K): Record<K, T[]> => {
  const result = {} as Record<K, T[]>;

  for (const item of array) {
    const key = keyFn(item);
    const bucket = result[key];

    if (bucket === undefined) {
      result[key] = [item];
    } else {
      bucket.push(item);
    }
  }

  return result;
};
