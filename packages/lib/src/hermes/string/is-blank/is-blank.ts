// 빈 문자열이거나 공백 문자만 있으면 true. 입력은 변형하지 않는다.
// `trim()`이 양 끝의 공백류(스페이스, 탭, 개행, NBSP 등 유니코드 공백)를 모두
// 제거하므로, 전부 공백이면 결과가 ""가 된다. 따라서 trim 결과의 빈 여부 한 번으로 판정된다.
export const isBlank = (str: string): boolean => {
  return str.trim() === "";
};
