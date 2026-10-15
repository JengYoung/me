// 가운데를 잘라 양끝을 보존한다. 긴 파일명/경로를 "long…name.txt"처럼
// 줄일 때 쓴다. length 이하면 그대로 둔다.
// 결과 전체 길이가 length가 되도록 suffix 자리를 먼저 빼고, 남은 길이를
// 앞쪽(head)과 뒤쪽(tail)에 나눠 준다. 홀수 잔여는 head에 더해 앞을 더 보존한다.
// length가 suffix 이하인 극단에서는 본문 자리가 없으므로 suffix를 length까지만
// 잘라 돌려준다.
export const truncateMiddle = (str: string, length: number, suffix = "…"): string => {
  if (str.length <= length) {
    return str;
  }

  if (suffix.length >= length) {
    return suffix.slice(0, length);
  }

  const visible = length - suffix.length;
  const headLength = Math.ceil(visible / 2);
  const tailLength = visible - headLength;

  const head = str.slice(0, headLength);
  // tailLength가 0이면 빈 문자열이어야 한다. slice(-0)은 전체를 반환하므로 분기한다.
  const tail = tailLength === 0 ? "" : str.slice(-tailLength);

  return head + suffix + tail;
};
