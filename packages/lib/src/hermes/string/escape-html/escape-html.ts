// HTML 특수문자를 엔티티로 치환한다. 텍스트를 마크업에 안전하게 끼워 넣을 때 쓴다.
// 입력은 변형하지 않고 새 문자열을 반환한다.
//
// `&`를 가장 먼저 치환해야 한다. 뒤에 치환하면 이미 만든 엔티티의 `&`까지
// 다시 `&amp;`로 이중 치환된다(`<` -> `&lt;` -> `&amp;lt;`). 그래서 순서가 중요하다.
const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export const escapeHtml = (str: string): string => {
  return str.replace(/[&<>"']/g, (char) => HTML_ENTITIES[char]);
};
