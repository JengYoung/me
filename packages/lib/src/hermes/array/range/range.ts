// [start, end) 구간을 step 간격으로 채운 숫자 배열을 반환한다. step 기본값은 1.
// step이 0이면(전진하지 않으므로) 빈 배열을 돌려준다.
// 음수 step도 지원한다: start > end 일 때 감소 수열을 만든다.
// 방향(step 부호)과 구간 방향이 어긋나면(예: start < end 인데 step < 0) 빈 배열이 된다.
export const range = (start: number, end: number, step = 1): number[] => {
  if (step === 0) {
    return [];
  }

  const result: number[] = [];
  if (step > 0) {
    for (let value = start; value < end; value += step) {
      result.push(value);
    }
  } else {
    for (let value = start; value > end; value += step) {
      result.push(value);
    }
  }

  return result;
};
