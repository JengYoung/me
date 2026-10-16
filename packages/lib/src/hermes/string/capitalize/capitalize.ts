// 첫 글자만 대문자로 만들고 나머지는 그대로 둔다. 빈 문자열은 빈 문자열 그대로.
export const capitalize = (word: string): string => {
  return word.charAt(0).toUpperCase() + word.slice(1);
};
