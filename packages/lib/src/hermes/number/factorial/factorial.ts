// 계승(factorial). n! = 1 * 2 * ... * n.
// 음수는 정의되지 않으므로 RangeError를 던진다. 0! = 1 (빈 곱의 항등원).
// 반복문으로 구현해 깊은 재귀의 스택 비용을 피한다.
export const factorial = (n: number): number => {
  if (n < 0) {
    throw new RangeError(`factorial is not defined for negative numbers: ${n}`);
  }

  let result = 1;
  for (let i = 2; i <= n; i += 1) {
    result *= i;
  }

  return result;
};
