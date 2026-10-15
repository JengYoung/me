export const union = <T>(a: T[], b: T[]): T[] => {
  // Set이 삽입 순서를 보존하므로 a 먼저, b 다음 순서로 넣으면 등장 순서가 유지되고
  // 중복은 자동으로 제거된다.
  return [...new Set([...a, ...b])];
};
