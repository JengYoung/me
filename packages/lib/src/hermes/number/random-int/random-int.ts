// [min, max] 구간의 정수 난수를 런타임 난수로 뽑는다. 양끝(min, max)을 모두 포함한다.
//
// min, max는 정수라고 가정한다. 구간 크기는 max - min + 1이라 max 쪽도 동일 확률로 뽑힌다.
// 매번 새 값을 계산해 반환하며 인자는 변형하지 않는다. 난수원은 Math.random이라
// 암호학적으로 안전하지 않다 (주사위/인덱스 같은 가벼운 무작위 정수 생성 용도).
// min === max면 항상 그 값을 반환한다. min <= max는 호출 측에서 보장한다.
export const randomInt = (min: number, max: number): number => {
  return min + Math.floor(Math.random() * (max - min + 1));
};
