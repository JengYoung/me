// 객체의 각 키를 keyFn으로 변환한 새 객체를 만든다. 값은 그대로 옮겨진다.
// keyFn이 같은 키를 여러 번 돌려주면 나중 항목이 우선한다.
// 자기 소유(own) 열거 가능 키만 다루며, 입력 객체는 변형하지 않는다.
export const mapKeys = <T extends object, K extends PropertyKey>(
  obj: T,
  keyFn: (key: keyof T, value: T[keyof T]) => K,
): Record<K, T[keyof T]> => {
  const result = {} as Record<K, T[keyof T]>;

  for (const key of Object.keys(obj) as (keyof T)[]) {
    const value = obj[key];
    result[keyFn(key, value)] = value;
  }

  return result;
};
