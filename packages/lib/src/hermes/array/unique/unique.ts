// 배열에서 중복을 제거한다. Set의 SameValueZero 동등성으로 판정하며,
// 각 값의 첫 등장 순서를 그대로 보존한다. 입력 배열은 변형하지 않는다.
export const unique = <T>(array: readonly T[]): T[] => {
  return [...new Set(array)];
};
