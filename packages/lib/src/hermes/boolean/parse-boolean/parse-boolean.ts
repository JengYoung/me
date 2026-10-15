// 다양한 입력을 boolean으로 해석한다.
// true/"true"/"1"/"yes"/"y"/"on"(대소문자·앞뒤 공백 무시)과 0이 아닌 숫자는 true,
// 그 외(false/0/null/undefined/빈 문자열 등)는 false.
const TRUTHY = new Set(["true", "1", "yes", "y", "on"]);

export const parseBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value !== 0;
  }
  if (typeof value === "string") {
    return TRUTHY.has(value.trim().toLowerCase());
  }
  return false;
};
