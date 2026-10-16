// URL/식별자용 슬러그를 만든다. 소문자로 내린 뒤 ASCII 영숫자가 아닌 문자가
// 이어진 구간을 "-" 하나로 합치고, 양끝의 "-"는 제거한다. 입력은 변형하지 않는다.
//
// `[^a-z0-9]+` 한 번의 치환으로 구분자 런을 단일 "-"로 접고, 다시 양끝 "-"만
// 잘라낸다. ASCII 기준이라 비ASCII 글자(한글 등)는 영숫자가 아니므로 구분자로 취급된다.
export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};
