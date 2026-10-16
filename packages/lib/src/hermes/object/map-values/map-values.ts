// 객체의 각 값을 valueFn으로 변환한 새 객체를 만든다. 키는 그대로 보존된다.
// 자기 소유(own) 열거 가능 키만 다루며, 입력 객체는 변형하지 않는다.
export const mapValues = <T extends object, V>(
  obj: T,
  valueFn: (value: T[keyof T], key: keyof T) => V,
): Record<keyof T, V> => {
  const result = {} as Record<keyof T, V>;

  for (const key of Object.keys(obj) as (keyof T)[]) {
    result[key] = valueFn(obj[key], key);
  }

  return result;
};
