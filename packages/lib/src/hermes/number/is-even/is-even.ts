// 짝수 여부. 2로 나눈 나머지가 0이면 짝수다.
// 음수와 0도 동일하게 판정된다 (-4, 0 모두 짝수). `% 2`는 음수에서도 0을 그대로 돌려준다.
export const isEven = (value: number): boolean => {
  return value % 2 === 0;
};
