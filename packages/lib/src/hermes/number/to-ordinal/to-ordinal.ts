// 정수를 영어 서수 문자열로 바꾼다. 1 -> "1st", 2 -> "2nd", 3 -> "3rd",
// 그 외에는 "th". 음수 부호와 0은 그대로 보존한다 (0 -> "0th", -1 -> "-1st").
//
// 영어 서수 규칙의 핵심 예외는 11·12·13이다. 끝자리만 보면 각각 1·2·3이라
// "st/nd/rd"가 될 것 같지만, 실제로는 "11th/12th/13th"다. 그래서 마지막 두
// 자리(mod 100)가 11~13이면 무조건 "th"로 처리하고, 그 밖에서만 끝자리
// (mod 10)로 "st/nd/rd"를 고른다.
// 비교는 절댓값으로 한다 (-21 의 끝자리 판정이 부호에 흔들리지 않게).
export const toOrdinal = (value: number): string => {
  const integer = Math.trunc(value);
  const abs = Math.abs(integer);
  const lastTwo = abs % 100;
  const lastOne = abs % 10;

  let suffix = "th";
  // 11~13은 예외라 끝자리와 무관하게 "th". 그 외에만 끝자리로 분기한다.
  if (lastTwo < 11 || lastTwo > 13) {
    if (lastOne === 1) {
      suffix = "st";
    } else if (lastOne === 2) {
      suffix = "nd";
    } else if (lastOne === 3) {
      suffix = "rd";
    }
  }

  return `${integer}${suffix}`;
};
