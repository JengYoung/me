// 최대공약수(GCD). 유클리드 호제법으로 구한다.
// 부호는 결과에 의미가 없으므로 입력을 절댓값으로 정규화한다 (gcd(-12, 8) === gcd(12, 8)).
// 한쪽이 0이면 다른 쪽의 절댓값이 곧 GCD다 (gcd(0, n) === |n|, gcd(0, 0) === 0).
export const gcd = (a: number, b: number): number => {
  let x = Math.abs(a);
  let y = Math.abs(b);

  while (y !== 0) {
    [x, y] = [y, x % y];
  }

  return x;
};
