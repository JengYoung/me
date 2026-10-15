// predicate를 통과한 엔트리를 제외한 새 객체를 만드는 유틸.
// `pickBy`의 반대 동작이다: predicate가 참인 엔트리를 버리고 나머지를 남긴다.
// 키가 아니라 값/키 조건으로 거르므로 반환 타입은 Partial<T>다.
// 원본은 변형하지 않고 남은 엔트리만 얕게 복사한다.
export const omitBy = <T extends object>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean,
): Partial<T> => {
  const result: Partial<T> = {};

  for (const key of Object.keys(obj) as (keyof T)[]) {
    const value = obj[key];
    if (!predicate(value, key)) {
      result[key] = value;
    }
  }

  return result;
};
