// 객체에서 지정한 키를 제외한 새 객체를 만드는 유틸.
// 원본을 변형하지 않고, 제외할 키를 Set으로 모아 나머지 엔트리만 얕게 복사한다.
// 자기 자신의 열거 가능 키만 순회하므로 상속 속성은 결과에 섞이지 않는다.
export const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const excluded = new Set<PropertyKey>(keys);
  const result = {} as Record<PropertyKey, unknown>;

  for (const key of Object.keys(obj) as (keyof T)[]) {
    if (!excluded.has(key)) {
      result[key] = obj[key];
    }
  }

  return result as Omit<T, K>;
};
