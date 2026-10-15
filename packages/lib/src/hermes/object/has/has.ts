// 경로 문자열로 중첩 객체/배열에 해당 키가 "존재하는지"만 판정하는 유틸.
// get과 달리 값 자체(undefined/null 여부)는 보지 않고, 키 소유 여부만 본다.
// 즉 { a: undefined }에서 has(obj, "a")는 true다.

// "a.b[0].c" -> ["a", "b", "0", "c"]
// 점 구분과 대괄호 인덱스를 모두 받는다. 빈 세그먼트는 버린다.
const parsePath = (path: string): string[] => {
  const segments: string[] = [];
  let current = "";

  const flush = (): void => {
    if (current.length > 0) {
      segments.push(current);
      current = "";
    }
  };

  for (let i = 0; i < path.length; i += 1) {
    const char = path[i];

    if (char === "." || char === "[" || char === "]") {
      flush();
      continue;
    }

    current += char;
  }

  flush();

  return segments;
};

// 값이 키 소유 여부를 물어볼 수 있는 객체/배열인지 좁힌다. null은 거른다.
const isIndexable = (value: unknown): value is Record<string, unknown> => {
  return value !== null && (typeof value === "object" || typeof value === "function");
};

/**
 * "a.b[0]" 경로가 존재하는지 판정한다.
 * 각 단계에서 현재 값이 인덱싱 가능한 객체이고 해당 키를 소유하면(Object.hasOwn) 다음으로 내려간다.
 * 중간이라도 키가 없거나 인덱싱 불가능한 값을 만나면 false.
 *
 * 키 존재만 보므로 값이 undefined여도(예: { a: undefined }) 키를 소유하면 true다.
 * 빈 경로("")는 세그먼트가 없어 항상 true(루트 자신은 존재).
 */
export const has = (obj: unknown, path: string): boolean => {
  const segments = parsePath(path);

  let cursor: unknown = obj;
  for (const key of segments) {
    if (!isIndexable(cursor) || !Object.hasOwn(cursor, key)) {
      return false;
    }

    cursor = cursor[key];
  }

  return true;
};
