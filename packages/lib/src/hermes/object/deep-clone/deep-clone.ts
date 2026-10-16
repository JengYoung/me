// plain object와 array를 재귀 복제해 입력과 구조를 공유하지 않는 새 값을 만든다.
// Date는 같은 시각의 새 인스턴스로 복제하고, 원시·함수 등 그 외 값은 참조를 그대로 유지한다.
// 순환 참조는 고려하지 않는다.

// 재귀 복제 대상인지 가르는 술어. array는 별도로 처리하므로 여기선 plain object만.
// Object.prototype 또는 프로토타입이 없는 객체만 plain object로 본다.
const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

/**
 * value를 재귀 복제한 새 값을 반환한다.
 *
 * - plain object와 array는 새로 만들어 각 원소/값을 재귀 복제한다.
 * - Date는 같은 시각(getTime)의 새 Date로 복제한다.
 * - 그 외(원시·함수·클래스 인스턴스 등)는 복제하지 않고 참조를 그대로 둔다.
 *
 * 복제된 plain object/array를 수정해도 원본에 영향이 가지 않는다(중첩까지 분리된다).
 * 순환 참조가 있는 입력에는 무한 재귀로 빠질 수 있어 지원하지 않는다.
 */
export const deepClone = <T>(value: T): T => {
  // array: 새 배열에 원소를 하나씩 재귀 복제해 담는다.
  if (Array.isArray(value)) {
    return value.map((element) => deepClone(element)) as T;
  }

  // Date: 내부 시각만 옮긴 새 인스턴스. (Date는 plain object가 아니라 위에서 따로 처리)
  if (value instanceof Date) {
    return new Date(value.getTime()) as T;
  }

  // plain object: 키별로 값을 재귀 복제한 새 객체를 만든다.
  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value)) {
      result[key] = deepClone(value[key]);
    }
    return result as T;
  }

  // 원시·함수·그 외 객체: 복제하지 않고 참조(또는 값)를 그대로 반환한다.
  return value;
};
