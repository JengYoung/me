// value를 digits 자리수로 반올림한다. digits 기본값 0은 정수 반올림.
// Math.round(value * 10**digits) / 10**digits 의 단순식은 부동소수점 오차로
// 흔히 어긋난다 (예: 1.005 * 100 === 100.49999999999999 -> 100). 그래서
// 지수 표기(toExponential)로 가수의 소수점만 옮겨 반올림한 뒤 되돌린다.
// 이렇게 하면 곱셈으로 생기는 표현 오차를 거치지 않아 1.005 같은 경계값이
// 기대대로 반올림된다.
// digits는 정수로 강제하고, 음수 digits(10의 자리 등 정수부 반올림)도 지원한다.
export const round = (value: number, digits = 0): number => {
  if (!Number.isFinite(value)) {
    return value;
  }

  const shift = Math.trunc(digits);

  // 가수와 지수를 분리해 지수에 shift를 더한 뒤 그 자리에서 반올림하고,
  // 다시 같은 크기만큼 지수를 빼서 원래 스케일로 되돌린다.
  const [mantissa, exponent] = value.toExponential().split("e");
  const rounded = Math.round(Number(`${mantissa}e${Number(exponent) + shift}`));
  const [resultMantissa, resultExponent] = rounded.toExponential().split("e");

  return Number(`${resultMantissa}e${Number(resultExponent) - shift}`);
};
