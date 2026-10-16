// 정수부에 천 단위 콤마를 넣는다. 1234567 -> "1,234,567".
// 콤마는 정수부에만 붙이고 소수부와 음수 부호는 그대로 보존한다
// (-1234.5 -> "-1,234.5").
//
// Intl.NumberFormat 대신 직접 구현한 이유: Intl은 로케일/환경에 따라 그룹
// 구분자가 달라지고(공백·점 등) maximumFractionDigits 기본값이 소수부를 잘라
// 결과가 미묘하게 흔들린다. 여기선 콤마 고정 + 소수부 완전 보존이 계약이라
// 문자열을 직접 다룬다.
//
// 정규식 `\B(?=(\d{3})+(?!\d))`는 "오른쪽으로 3자리씩 묶었을 때 그 경계이면서
// 단어 경계가 아닌 위치" 앞에 콤마를 끼운다. 정수부에만 적용해 소수점 이후로는
// 번지지 않게 한다.
export const formatThousands = (value: number): string => {
  if (!Number.isFinite(value)) {
    return String(value);
  }

  const sign = value < 0 ? "-" : "";
  // 부호는 따로 떼어 두고 절댓값 문자열만 가공한다.
  const [integer, fraction] = Math.abs(value).toString().split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return `${sign}${grouped}${fraction === undefined ? "" : `.${fraction}`}`;
};
