// 임의의 입력을 숫자로 안전하게 파싱한다. 파싱이 의미 없거나 실패하면
// fallback(기본 0)을 돌려준다.
//
// Number()의 함정을 피하려고 사례별로 분기한다:
//   - Number("")  === 0, Number("   ") === 0, Number(null) === 0  -> 의도와 다름.
//     "빈 입력"은 0이 아니라 fallback이어야 하므로 문자열은 trim 후 빈값을 거른다.
//   - Number([])  === 0, Number([5]) === 5  -> 배열/객체는 숫자로 보지 않고 fallback.
//   - Number(true) === 1 -> boolean도 숫자가 아니므로 fallback.
// number는 NaN만 거르고(±Infinity는 유효한 수로 통과), 그 외 타입은 문자열로
// 만들어 trim한 뒤 Number로 변환한다. 결과가 NaN이면 fallback.
export const safeParseNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number") {
    return Number.isNaN(value) ? fallback : value;
  }

  // boolean/배열/객체 등은 Number()가 우연히 숫자를 뱉으므로 명시적으로 막는다.
  if (typeof value !== "string" && typeof value !== "bigint") {
    return fallback;
  }

  const text = String(value).trim();
  if (text === "") {
    return fallback;
  }

  const parsed = Number(text);

  return Number.isNaN(parsed) ? fallback : parsed;
};
