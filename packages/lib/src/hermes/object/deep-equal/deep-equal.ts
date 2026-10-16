// 두 값의 깊은 동등성을 판정한다. plain object와 array는 구조를 재귀 비교하고,
// 그 외(원시·Date·함수 등)는 자기 규칙으로 비교한다. 순환 참조는 고려하지 않는다.

// 더 깊이 들어갈 대상인지 가르는 술어. array는 별도로 처리하므로 여기선 plain object만.
// Object.prototype 또는 프로토타입이 없는 객체만 plain object로 본다.
const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

/**
 * a와 b가 깊은 값으로 동등한지 판정한다.
 *
 * - 원시는 SameValueZero로 비교한다(NaN끼리는 같다고, +0과 -0은 같다고 본다).
 * - array는 길이와 각 원소를 순서대로 재귀 비교한다.
 * - plain object는 키 집합과 각 키의 값을 재귀 비교한다.
 * - Date는 같은 시각(getTime)이면 같다고 본다.
 * - 한쪽만 array/object이거나 종류가 다르면 같지 않다.
 *
 * 순환 참조가 있는 입력에는 무한 재귀로 빠질 수 있어 지원하지 않는다.
 */
export const deepEqual = (a: unknown, b: unknown): boolean => {
  // 같은 참조이거나 NaN끼리처럼 원시가 동일하면 즉시 참(SameValueZero).
  if (Object.is(a, b)) {
    return true;
  }

  // 여기부터 둘 다 객체여야 깊이 비교할 수 있다. 하나라도 객체가 아니면 다르다.
  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) {
    return false;
  }

  // Date는 같은 시각이면 같다. 한쪽만 Date면 종류가 달라 같지 않다.
  const aIsDate = a instanceof Date;
  const bIsDate = b instanceof Date;
  if (aIsDate || bIsDate) {
    return aIsDate && bIsDate && a.getTime() === b.getTime();
  }

  // array는 array끼리만 같을 수 있다. 길이와 원소를 순서대로 재귀 비교한다.
  const aIsArray = Array.isArray(a);
  const bIsArray = Array.isArray(b);
  if (aIsArray || bIsArray) {
    if (!aIsArray || !bIsArray || a.length !== b.length) {
      return false;
    }
    return a.every((value, index) => deepEqual(value, b[index]));
  }

  // 남은 건 plain object. 그 외 객체(Map/Set/클래스 인스턴스 등)는 비교 규칙이 없어 다르게 본다.
  if (!isPlainObject(a) || !isPlainObject(b)) {
    return false;
  }

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) {
    return false;
  }

  // 키 집합이 같고(= b가 같은 키를 모두 가짐) 각 값이 깊게 같아야 한다.
  return aKeys.every((key) => Object.hasOwn(b, key) && deepEqual(a[key], b[key]));
};
