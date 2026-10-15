// 배열 항목을 keyFn이 돌려주는 키로 묶어 키별 개수를 센다. 입력 배열은
// 변형하지 않고 { 키: 개수 } 객체를 새로 반환한다.
export const countBy = <T, K extends PropertyKey>(array: readonly T[], keyFn: (item: T) => K): Record<K, number> => {
  const result = {} as Record<K, number>;

  for (const item of array) {
    const key = keyFn(item);
    result[key] = (result[key] ?? 0) + 1;
  }

  return result;
};
