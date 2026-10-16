// str 안에서 search가 겹치지 않게 등장하는 횟수를 센다. 입력은 변형하지 않는다.
// search가 ""이면 0을 반환한다 (빈 문자열은 모든 위치에 무한히 매칭되므로 정의상 제외).
//
// 매칭 후 인덱스를 search.length만큼 건너뛰어 겹침을 막는다.
// 예: countOccurrences("aaaa", "aa")는 [0..2)와 [2..4) 두 번 -> 2 (1,2,3에서 다시 세지 않음).
export const countOccurrences = (str: string, search: string): number => {
  if (search === "") {
    return 0;
  }

  let count = 0;
  let index = str.indexOf(search);

  while (index !== -1) {
    count += 1;
    index = str.indexOf(search, index + search.length);
  }

  return count;
};
