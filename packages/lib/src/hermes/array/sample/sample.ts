// 배열에서 무작위로 원소 하나를 골라 반환한다. 빈 배열이면 null을 반환한다.
// 각 원소가 균등 확률로 뽑힌다. 난수는 런타임의 Math.random을 사용한다.
export const sample = <T>(array: T[]): T | null => {
  if (array.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * array.length);
  return array[index];
};
