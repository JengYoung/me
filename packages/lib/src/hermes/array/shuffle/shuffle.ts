// Fisher-Yates 셔플로 무작위 순서의 새 배열을 반환한다. 입력 배열은 변형하지
// 않는다. 뒤에서 앞으로 훑으며 각 위치를 [0, index] 구간의 임의 위치와 교환하므로
// 모든 순열이 균등 확률로 나온다. 난수는 런타임의 Math.random을 사용한다.
export const shuffle = <T>(array: T[]): T[] => {
  const result = array.slice();

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    const temp = result[index];
    result[index] = result[swap];
    result[swap] = temp;
  }

  return result;
};
