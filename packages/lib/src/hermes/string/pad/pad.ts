// 양쪽을 char로 균등하게 채워 가운데 정렬한다. length 이하면 그대로 둔다.
// 채울 총량을 좌우로 나누되, 홀수 잔여는 오른쪽에 더한다 (왼쪽 floor, 오른쪽 ceil).
// char가 여러 글자여도 되도록 padStart/padEnd로 채운 뒤 정확한 길이로 자른다.
// String.prototype.padStart/padEnd는 char가 빈 문자열이면 아무것도 채우지 않으므로
// 그 경우 원본이 그대로 반환된다.
export const pad = (str: string, length: number, char = " "): string => {
  if (str.length >= length) {
    return str;
  }

  const total = length - str.length;
  const left = Math.floor(total / 2);

  // 왼쪽을 left만큼 채운 길이까지 padStart, 그 결과를 다시 length까지 padEnd.
  // 남은 오른쪽(ceil)은 length - (str.length + left)로 자동 결정된다.
  return str.padStart(str.length + left, char).padEnd(length, char);
};
