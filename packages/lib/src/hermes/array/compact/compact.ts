type Falsy = false | null | undefined | 0 | "";

// NaN은 number 타입이라 위 Falsy 리터럴 유니온으로는 표현할 수 없다.
// 런타임에서는 Boolean(NaN) === false라 함께 걸러지고, 타입 위에서는
// 입력의 number 부분이 그대로 T로 남는다(예: compact([1, 0, 2]) -> number[]).
export const compact = <T>(array: ReadonlyArray<T | Falsy>): T[] => {
  return array.filter((value): value is T => Boolean(value));
};
