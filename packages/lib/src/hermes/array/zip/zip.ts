export const zip = <A, B>(a: A[], b: B[]): [A, B][] => {
  // 길이가 다르면 짧은 쪽에서 멈춘다. 남는 원소는 짝이 없으므로 버린다.
  const length = Math.min(a.length, b.length);
  const result: [A, B][] = [];

  for (let index = 0; index < length; index += 1) {
    result.push([a[index], b[index]]);
  }

  return result;
};
