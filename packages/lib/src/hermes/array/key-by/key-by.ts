// 배열을 keyFn이 돌려주는 키로 인덱싱해 { 키: 항목 } 객체를 만든다.
// 같은 키가 여러 번 나오면 마지막 항목이 우선한다. 입력 배열은 변형하지 않는다.
export const keyBy = <T, K extends PropertyKey>(array: readonly T[], keyFn: (item: T) => K): Record<K, T> => {
  const result = {} as Record<K, T>;

  for (const item of array) {
    result[keyFn(item)] = item;
  }

  return result;
};
