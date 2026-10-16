// 경로 문자열로 중첩 객체/배열에 안전 접근하는 유틸.
// "a.b[0].c" 같은 경로를 키 목록 ["a", "b", "0", "c"]로 쪼갠 뒤 한 단계씩 내려간다.
// 중간에 null/undefined나 인덱싱 불가능한 값을 만나면 즉시 defaultValue로 빠진다.

// "a.b[0].c" -> ["a", "b", "0", "c"]
// 점 구분과 대괄호 인덱스를 모두 받는다. 대괄호 안 키(숫자/문자 모두)는 한 세그먼트로 본다.
// 빈 세그먼트(예: 선행 점, 연속 점)는 버려서 "" 키로 잘못 내려가지 않게 한다.
const parsePath = (path: string): string[] => {
  const segments: string[] = [];
  let current = "";

  // [start, end) 구간에 모인 키를 확정한다. 빈 문자열은 버린다.
  const flush = (): void => {
    if (current.length > 0) {
      segments.push(current);
      current = "";
    }
  };

  for (let i = 0; i < path.length; i += 1) {
    const char = path[i];

    if (char === ".") {
      flush();
      continue;
    }

    // 대괄호 시작: 직전까지의 키를 끊고, 닫는 괄호 전까지를 다음 키로 모은다.
    if (char === "[") {
      flush();
      continue;
    }

    if (char === "]") {
      flush();
      continue;
    }

    current += char;
  }

  flush();

  return segments;
};

// 값이 키로 인덱싱 가능한 객체/배열인지 좁힌다. null도 typeof로는 "object"라 따로 거른다.
const isIndexable = (value: unknown): value is Record<string, unknown> => {
  return value !== null && (typeof value === "object" || typeof value === "function");
};

/**
 * "a.b[0].c" 경로로 중첩 값을 안전하게 읽는다.
 * 경로가 끊기면(중간이 null/undefined이거나 키가 없으면) defaultValue를 반환하고,
 * defaultValue가 없으면 undefined를 반환한다.
 *
 * 입력 obj는 unknown으로 받아 어떤 값이든 던지지 않고 처리한다.
 * 반환 타입은 호출부가 지정한 T로 단언한다(런타임 보장은 경로 존재 여부까지다).
 */
export const get = <T = unknown>(obj: unknown, path: string, defaultValue?: T): T => {
  const segments = parsePath(path);

  let cursor: unknown = obj;
  for (const key of segments) {
    if (!isIndexable(cursor)) {
      return defaultValue as T;
    }

    cursor = cursor[key];
  }

  // 경로 끝까지 내려갔는데 값이 undefined면 "없음"으로 보고 defaultValue로 대체한다.
  // (null은 명시적으로 들어있던 값이므로 그대로 돌려준다.)
  return cursor === undefined ? (defaultValue as T) : (cursor as T);
};
