// alphabet에서 length 글자를 런타임 난수로 뽑아 문자열을 만든다.
// 기본 alphabet은 영숫자(A-Z, a-z, 0-9). length <= 0이면 빈 문자열을 반환한다.
//
// 매번 새 문자열을 만들어 반환하며 인자는 변형하지 않는다. 난수원은 Math.random이라
// 암호학적으로 안전하지 않다 (식별자/토큰용 가벼운 무작위 문자열 생성 용도).
const DEFAULT_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export const randomString = (length: number, alphabet: string = DEFAULT_ALPHABET): string => {
  if (length <= 0 || alphabet.length === 0) {
    return "";
  }

  let result = "";
  for (let index = 0; index < length; index += 1) {
    const pick = Math.floor(Math.random() * alphabet.length);
    result += alphabet[pick];
  }

  return result;
};
