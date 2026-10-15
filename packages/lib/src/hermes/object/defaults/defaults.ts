// obj에서 값이 없는(undefined) 키를 defaultValues로 채운 새 객체를 만든다.
// obj에 이미 값이 있으면(undefined가 아니면) 그 값을 그대로 둔다.
// 입력 객체들은 변형하지 않고, obj의 얕은 복사본 위에 빈 칸만 메운다.
export const defaults = <T extends object>(obj: Partial<T>, defaultValues: T): T => {
  const result = { ...obj } as T;

  for (const key of Object.keys(defaultValues) as (keyof T)[]) {
    if (result[key] === undefined) {
      result[key] = defaultValues[key];
    }
  }

  return result;
};
