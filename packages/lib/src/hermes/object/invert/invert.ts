// 객체의 키와 값을 뒤집은 새 객체를 만든다. 원래 값이 새 키가 되고,
// 원래 키가 새 값이 된다. 객체 키는 항상 문자열로 강제되므로 결과는
// Record<string, string>이다. 서로 다른 키가 같은 값을 가리키면(값 충돌)
// 등장 순서상 마지막 키가 우선한다. 입력 객체는 변형하지 않는다.
export const invert = <T extends Record<PropertyKey, PropertyKey>>(obj: T): Record<string, string> => {
  const result: Record<string, string> = {};

  for (const key of Object.keys(obj)) {
    result[String(obj[key])] = key;
  }

  return result;
};
