// 배열을 predicate 통과 여부로 두 그룹으로 나눈다. [통과한 항목, 실패한 항목]
// 튜플을 반환하며 각 그룹은 등장 순서를 보존한다. 입력 배열은 변형하지 않는다.
export const partition = <T>(array: readonly T[], predicate: (item: T) => boolean): [T[], T[]] => {
  const passed: T[] = [];
  const failed: T[] = [];

  for (const item of array) {
    if (predicate(item)) {
      passed.push(item);
    } else {
      failed.push(item);
    }
  }

  return [passed, failed];
};
