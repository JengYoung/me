// 객체에서 지정한 키만 골라 새 객체를 만드는 유틸.
// 원본을 변형하지 않고 얕은 복사로 선택된 엔트리만 담는다.
// keys에 들어온 키라도 객체에 실제로 없으면(상속 속성 등) 건너뛰어,
// 결과에 undefined 값 엔트리가 새로 생기지 않게 한다.
export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
  }

  return result;
};
