export const difference = <T>(a: T[], b: T[]): T[] => {
  // b를 Set으로 만들어 포함 검사를 O(1)로 한다. a의 순서와 중복은 그대로 보존된다.
  const exclude = new Set(b);

  return a.filter((value) => !exclude.has(value));
};
