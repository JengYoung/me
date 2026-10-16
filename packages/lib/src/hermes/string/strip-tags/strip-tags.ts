// `<tag>`, `</tag>`, `<tag attr>` 같은 HTML 태그만 제거하고 사이 텍스트는 남긴다.
// 입력은 변형하지 않고 새 문자열을 반환한다.
//
// `<\/?[a-zA-Z][^>]*>` — `<` 또는 `</` 뒤에 글자로 시작하는 것만 태그로 본다.
// 덕분에 "1 < 2 and 3 > 2" 처럼 글자가 아닌 게 따라오는 단독 부등호는 그대로 남는다.
export const stripTags = (str: string): string => {
  return str.replace(/<\/?[a-zA-Z][^>]*>/g, "");
};
