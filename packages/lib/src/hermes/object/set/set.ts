// 경로 문자열 위치에 값을 설정한 "새" 객체를 반환하는 불변(immutable) 유틸.
// 입력 obj는 변형하지 않고, 경로상에 놓인 객체/배열만 얕은 복사로 갈아끼운다(경로 밖 가지는 공유).
// 중간 경로가 없으면 만들어 채우는데, 다음 세그먼트가 배열 인덱스면 배열을, 아니면 객체를 만든다.

// 경로 세그먼트. 키 문자열과 "이 위치가 배열 인덱스인지"를 함께 들고 다닌다.
// 인덱스 여부로 (1) 비어있는 중간 경로를 배열로 만들지 객체로 만들지, (2) 인덱스를 number로 쓸지를 정한다.
interface Segment {
  readonly key: string;
  readonly isIndex: boolean;
}

// "a.b[0].c" -> [a, b, 0(index), c]
// 점 뒤 키는 일반 키, 대괄호 안 키는 인덱스로 표시한다.
// 점 표기라도 순수 숫자 문자열이면 인덱스로 본다(예: "a.0.b"의 0).
const parsePath = (path: string): Segment[] => {
  const segments: Segment[] = [];
  let current = "";
  // 지금 모으는 키가 대괄호 안에서 시작했는지. 그러면 무조건 인덱스로 본다.
  let inBracket = false;

  // 모인 키를 세그먼트로 확정한다. 빈 키는 버린다.
  const flush = (): void => {
    if (current.length > 0) {
      // 대괄호 안이었거나, 점 표기라도 순수 정수 문자열이면 인덱스로 취급한다.
      const isIndex = inBracket || /^\d+$/.test(current);
      segments.push({ key: current, isIndex });
      current = "";
    }
    inBracket = false;
  };

  for (let i = 0; i < path.length; i += 1) {
    const char = path[i];

    if (char === ".") {
      flush();
      continue;
    }

    if (char === "[") {
      flush();
      inBracket = true;
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

// 값이 우리가 얕은 복사로 갈아끼울 수 있는 평범한 객체/배열인지 좁힌다. null은 거른다.
const isContainer = (value: unknown): value is Record<string, unknown> | unknown[] => {
  return value !== null && typeof value === "object";
};

// 다음 세그먼트의 인덱스 여부에 맞춰, 자리에 둘 빈 컨테이너를 고른다.
const emptyContainerFor = (segment: Segment): Record<string, unknown> | unknown[] => {
  return segment.isIndex ? [] : {};
};

// 컨테이너를 한 단계 얕은 복사한다. 배열은 배열로, 객체는 객체로 보존한다.
const shallowClone = (value: Record<string, unknown> | unknown[]): Record<string, unknown> | unknown[] => {
  return Array.isArray(value) ? value.slice() : { ...value };
};

// segments[depth]부터 재귀로 내려가며 복사본을 만들고, 마지막 위치에 value를 박는다.
// node는 "현재 깊이에서 들어있던 값"(없을 수도 있어 unknown). 항상 새 컨테이너를 반환한다.
const setIn = (
  node: unknown,
  segments: Segment[],
  depth: number,
  value: unknown,
): Record<string, unknown> | unknown[] => {
  const segment = segments[depth];
  const isLast = depth === segments.length - 1;

  // 현재 자리에 컨테이너가 있으면 복사해 쓰고, 없으면 다음 세그먼트 종류에 맞는 빈 컨테이너를 만든다.
  // (배열 자리에 객체가 있는 식의 타입 불일치도 새 컨테이너로 교체해 일관성을 맞춘다.)
  const base =
    isContainer(node) && Array.isArray(node) === segment.isIndex ? shallowClone(node) : emptyContainerFor(segment);

  // 배열이면 number 인덱스로, 객체면 string 키로 쓴다.
  // (Array를 string 키로 인덱싱해도 동작하지만, 인덱스는 number로 다뤄 길이/희소 배열 의미를 살린다.)
  if (Array.isArray(base)) {
    const index = Number(segment.key);
    base[index] = isLast ? value : setIn(base[index], segments, depth + 1, value);
    return base;
  }

  base[segment.key] = isLast ? value : setIn(base[segment.key], segments, depth + 1, value);
  return base;
};

/**
 * "a.b[0].c" 경로에 value를 설정한 새 객체를 반환한다(입력 obj 불변).
 * 경로상의 컨테이너만 얕은 복사로 교체하고, 경로 밖 가지는 원본과 그대로 공유한다.
 * 중간 경로가 없으면 만들며, 다음 세그먼트가 인덱스면 배열을, 아니면 객체를 생성한다.
 *
 * 빈 경로("")면 설정할 위치가 없으므로 입력을 얕은 복사해 그대로 돌려준다.
 * 반환 타입은 입력과 같은 T로 단언한다(경로 생성으로 구조가 넓어질 수 있음은 호출부 책임).
 */
export const set = <T extends object>(obj: T, path: string, value: unknown): T => {
  const segments = parsePath(path);

  if (segments.length === 0) {
    return shallowClone(obj as Record<string, unknown> | unknown[]) as T;
  }

  return setIn(obj, segments, 0, value) as T;
};
