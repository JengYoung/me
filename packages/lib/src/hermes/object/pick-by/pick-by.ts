// predicate를 통과한 엔트리만 골라 새 객체를 만드는 유틸.
// 키가 아니라 값/키 조건으로 거르므로 어떤 키가 남을지 정적으로 알 수 없다.
// 그래서 반환 타입은 Partial<T>다 (모든 키가 빠질 수 있다).
// 원본은 변형하지 않고 통과한 엔트리만 얕게 복사한다.
export const pickBy = <T extends object>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean,
): Partial<T> => {
  const result: Partial<T> = {};

  for (const key of Object.keys(obj) as (keyof T)[]) {
    const value = obj[key];
    if (predicate(value, key)) {
      result[key] = value;
    }
  }

  return result;
};
