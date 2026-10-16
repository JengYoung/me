// str 안의 `{key}` 자리표시자를 data[key] 값으로 치환한다.
// data에 없는 key의 `{key}`는 그대로 둔다 (입력은 변형하지 않고 새 문자열을 반환).
//
// 정규식 `/\{(\w+)\}/g`로 한 번 훑으며 매칭만 교체한다. key는 영숫자/언더스코어(\w)만
// 받으므로 `{` 만 있고 닫히지 않은 텍스트나 `{ key }` 같은 공백 포함 형태는 매칭되지 않아
// 원문이 보존된다. 값이 number면 String()으로 문자열화한다.
const PLACEHOLDER = /\{(\w+)\}/g;

export const template = (str: string, data: Record<string, string | number>): string => {
  return str.replace(PLACEHOLDER, (match, key: string) => {
    const value = data[key];
    return value === undefined ? match : String(value);
  });
};
