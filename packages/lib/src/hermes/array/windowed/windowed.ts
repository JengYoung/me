export const windowed = <T>(array: T[], size: number, step = 1): T[][] => {
  if (size <= 0 || step <= 0) {
    return [];
  }

  const result: T[][] = [];

  // 마지막 시작 인덱스는 size만큼 꽉 찬 윈도우가 나오는 지점까지다.
  // array.length < size면 루프가 한 번도 돌지 않아 빈 배열이 된다.
  for (let index = 0; index + size <= array.length; index += step) {
    result.push(array.slice(index, index + size));
  }

  return result;
};
