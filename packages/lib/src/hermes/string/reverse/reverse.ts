// 문자 순서를 뒤집어 새 문자열을 반환한다. 입력은 변형하지 않는다.
// `str.split("")`은 서로게이트 쌍(이모지 등)을 반쪽으로 쪼개 깨뜨리므로,
// 코드포인트 단위로 도는 문자열 이터레이터(`[...str]`)로 안전하게 뒤집는다.
export const reverse = (str: string): string => {
  return [...str].reverse().join("");
};
