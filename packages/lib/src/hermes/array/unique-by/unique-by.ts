// keyFn이 돌려준 키를 기준으로 중복을 제거한다. 같은 키가 처음 나온 항목만
// 남기고 첫 등장 순서를 보존한다. 입력 배열은 변형하지 않는다.
// 키 비교는 Set의 SameValueZero 동등성을 따른다.
export const uniqueBy = <T, K>(array: readonly T[], keyFn: (item: T) => K): T[] => {
  const seen = new Set<K>();
  const result: T[] = [];

  for (const item of array) {
    const key = keyFn(item);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(item);
  }

  return result;
};
