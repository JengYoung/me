// [min, max) 구간의 실수 난수를 런타임 난수로 뽑는다. min은 포함, max는 제외다.
//
// 매번 새 값을 계산해 반환하며 인자는 변형하지 않는다. 난수원은 Math.random이라
// 암호학적으로 안전하지 않다 (가벼운 무작위 실수 생성 용도).
// min === max면 구간이 비어 있어 항상 min을 반환한다. min > max도 막지 않으므로
// 호출 측에서 min <= max를 보장한다.
export const random = (min: number, max: number): number => {
  return min + Math.random() * (max - min);
};
