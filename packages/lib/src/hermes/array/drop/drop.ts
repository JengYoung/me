// 배열 앞에서 n개를 제외한 나머지를 새 배열로 반환한다. 입력 배열은 변형하지 않는다.
// n이 0 이하면 전체 복사본, n이 길이 이상이면 빈 배열을 돌려준다.
// slice의 음수 인덱스 해석을 피하려고 n을 [0, length]로 먼저 클램프한다.
export const drop = <T>(array: readonly T[], n: number): T[] => {
  const count = Math.min(Math.max(n, 0), array.length);
  return array.slice(count);
};
