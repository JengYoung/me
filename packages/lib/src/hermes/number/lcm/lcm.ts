import { gcd } from "../gcd/index";

// 최소공배수(LCM). lcm(a, b) = |a * b| / gcd(a, b) 로 구한다.
// 한쪽이 0이면 공배수가 0뿐이므로 0을 반환한다 (gcd가 0이 되어 나눗셈을 피하는 의미도 있다).
// 부호는 GCD와 마찬가지로 결과에 의미가 없어 절댓값으로 정규화한다.
export const lcm = (a: number, b: number): number => {
  if (a === 0 || b === 0) {
    return 0;
  }

  return Math.abs(a / gcd(a, b)) * Math.abs(b);
};
