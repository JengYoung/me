import { isEven } from "../is-even/index";

// 홀수 여부. 짝수가 아니면 홀수다. isEven을 부정해 짝/홀 판정 규칙을 한 곳에 둔다.
// 음수도 동일하게 판정된다 (-3은 홀수).
export const isOdd = (value: number): boolean => {
  return !isEven(value);
};
