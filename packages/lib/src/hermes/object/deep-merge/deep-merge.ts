// 중첩 plain object를 재귀 병합한다. 양쪽 모두 plain object인 키만 더 깊이 들어가고,
// 배열·원시·Date 등 그 외 값은 source 쪽으로 통째 교체한다(병합하지 않는다).
// 입력을 변형하지 않고 항상 새 객체를 반환하는 순수 함수다.

// 재귀 경계를 정하는 술어. 더 깊이 병합할 수 있는 건 "plain object"뿐이다.
// 배열·null·Date·Map 같은 특수 객체는 부분 병합하면 의미가 깨지므로 통째 교체 대상으로 둔다.
// Object.prototype 또는 프로토타입이 없는(Object.create(null)) 객체만 plain object로 본다.
const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

/**
 * target과 source를 재귀 병합한 새 객체를 반환한다.
 *
 * - 같은 키에서 양쪽이 모두 plain object면 그 안으로 재귀해 병합한다.
 * - 그 외(배열·원시·Date·null 등)는 source 값으로 교체한다. 배열은 원소별 병합하지 않는다.
 * - source에만 있는 키는 그대로 추가되고, target에만 있는 키는 보존된다.
 *
 * target·source 어느 쪽도 변형하지 않는다. 중첩 객체도 새로 만들어 채우므로,
 * 반환값을 수정해도 입력에 영향이 가지 않는다.
 */
export const deepMerge = <T extends object, S extends object>(target: T, source: S): T & S => {
  // 한쪽이라도 plain object가 아니면 병합할 구조가 없다. source를 우선해 교체한다.
  if (!isPlainObject(target) || !isPlainObject(source)) {
    return source as unknown as T & S;
  }

  const result: Record<string, unknown> = { ...target };

  for (const key of Object.keys(source)) {
    const sourceValue = source[key as keyof S];
    const targetValue = result[key];

    // 양쪽이 모두 plain object일 때만 한 단계 더 깊이 병합한다.
    if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
      result[key] = deepMerge(targetValue, sourceValue);
      continue;
    }

    // 그 외에는 source 값으로 교체한다.
    result[key] = sourceValue;
  }

  return result as T & S;
};
