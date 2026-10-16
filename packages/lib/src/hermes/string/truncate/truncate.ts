// 문자열이 length 이하면 그대로 두고, 초과하면 뒤를 잘라 suffix를 붙인다.
// 핵심은 "결과 전체 길이"가 length가 되도록 맞추는 것이다. 그래서 잘라낼
// 본문 길이는 length - suffix.length가 된다 (suffix 자리를 미리 비워 둔다).
// length가 suffix보다 짧은 극단(예: length 1, suffix "…")에서는 본문이 음수로
// 가지 않게 막고, suffix 자체를 length까지만 잘라 돌려준다.
export const truncate = (str: string, length: number, suffix = "…"): string => {
  if (str.length <= length) {
    return str;
  }

  // suffix가 length를 다 차지하거나 넘으면 본문이 들어갈 자리가 없다.
  if (suffix.length >= length) {
    return suffix.slice(0, length);
  }

  return str.slice(0, length - suffix.length) + suffix;
};
