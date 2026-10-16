// keyFn이 돌려준 키를 기준으로 오름차순 안정 정렬한 새 배열을 반환한다.
// 입력 배열은 변형하지 않는다. 키가 같은 항목들은 원래 순서를 유지한다(안정).
//
// 키 타입은 number | string로 한정한다. 두 키를 빼거나 직접 비교하는 대신
// compareKey 하나로 처리해, number는 차이로 string은 사전식으로 비교한다.
// string 비교에 localeCompare를 쓰지 않는 이유는 로케일에 따라 결과가 달라져
// 코드 단위 비교(`<`/`>`)가 더 결정적이기 때문이다.
const compareKey = (a: number | string, b: number | string): number => {
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }

  const left = String(a);
  const right = String(b);
  if (left < right) {
    return -1;
  }
  if (left > right) {
    return 1;
  }
  return 0;
};

export const sortBy = <T>(array: T[], keyFn: (item: T) => number | string): T[] => {
  // 키를 항목당 한 번만 계산해 두고(슈워츠 변환) 비교에서 재호출하지 않는다.
  // index를 함께 들고 가 동점일 때 원래 순서로 풀어 안정성을 보장한다.
  // (Array.prototype.sort 자체도 ES2019부터 안정이지만, 키 캐싱을 위해 래핑한다.)
  return array
    .map((item, index) => ({ item, index, key: keyFn(item) }))
    .sort((a, b) => compareKey(a.key, b.key) || a.index - b.index)
    .map((entry) => entry.item);
};
