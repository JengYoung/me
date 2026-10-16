import { capitalize } from "../capitalize/index";
import { isAsciiDigit, isAsciiLower, isAsciiUpper } from "../char/index";

// 케이스 변환 유틸. splitWords가 어떤 케이스든 소문자 단어 배열로 쪼개고,
// toXxxCase 조립기가 타깃 케이스로 다시 합친다.
// 이 구조라 케이스 간 변환이 N×N 조합 없이 전부 동작한다 (kebab->Pascal, snake->camel, ...).

// 단어를 끊는 구분자. 공백류와 `.` `_` `-`. (원본 정규식의 `[\s._-]`와 동일한 문자 집합)
// 비ASCII 글자는 여기 안 걸리므로 단어 안에 그대로 보존된다 (글자를 흘리지 않는다).
const SEPARATOR = /[\s._-]/;

/**
 * 어떤 케이스의 문자열이든 소문자 단어 배열로 쪼갠다.
 * 모든 toXxxCase가 이 결과를 조립하므로, 이 함수의 분할 규칙이 곧 변환 전체의 동작을 정한다.
 *
 * 정규식 체인(replace x2 -> split -> filter -> map) 대신 문자 단위 단일 패스로 구현했다.
 * core 라이브러리라 길거나 신뢰할 수 없는 입력이 들어올 수 있는데,
 * 정규식 `([A-Z]+)([A-Z][a-z])`는 긴 대문자 런에서 O(n^2) 백트래킹이 난다.
 * 단일 패스는 O(n)이고 중간 문자열/배열 할당도 없다.
 *
 * 새 단어가 시작되는 경계는 둘 중 하나다 (대문자 A-Z에서만 판정):
 *   1. 소문자/숫자 다음의 대문자        : "fooBar"     -> foo | Bar
 *   2. 대문자 런의 끝(= 다음이 소문자)  : "HTMLParser" -> HTML | Parser
 * 구분자(SEPARATOR)는 단어를 끊고 결과에서 빠진다.
 * 머리글자 묶음은 단어로 쪼갠 뒤 소문자로 정규화된다 ("HTMLParser" -> ["html", "parser"]).
 */
export const splitWords = (input: string): string[] => {
  const words: string[] = [];
  // 현재 모으는 중인 단어의 시작 인덱스. 단어 밖이면 -1.
  let start = -1;

  // [start, end) 구간을 한 단어로 확정한다.
  const flush = (end: number): void => {
    if (start >= 0) {
      words.push(input.slice(start, end).toLowerCase());
      start = -1;
    }
  };

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    // 구분자: 진행 중이던 단어를 끊고 이 문자 자체는 버린다.
    if (SEPARATOR.test(char)) {
      flush(i);
      continue;
    }

    // 단어의 첫 글자: 시작점만 잡고 넘어간다 (경계 판정 대상 아님).
    if (start < 0) {
      start = i;
      continue;
    }

    // 단어 중간의 대문자만 새 단어의 경계가 될 수 있다.
    if (isAsciiUpper(char)) {
      const prev = input[i - 1];
      const next = input[i + 1];
      // 규칙 1: "fooBar" 의 B — 소문자/숫자 바로 뒤의 대문자
      const afterLowerOrDigit = isAsciiLower(prev) || isAsciiDigit(prev);
      // 규칙 2: "HTMLParser" 의 P — 대문자 런의 마지막(다음 글자가 소문자)
      const acronymThenWord = isAsciiUpper(prev) && isAsciiLower(next);
      if (afterLowerOrDigit || acronymThenWord) {
        flush(i);
        start = i;
      }
    }
  }

  // 마지막 단어 확정.
  flush(input.length);

  return words;
};

export const toCamelCase = (input: string): string => {
  return splitWords(input)
    .map((word, index) => (index === 0 ? word : capitalize(word)))
    .join("");
};

export const toPascalCase = (input: string): string => {
  return splitWords(input).map(capitalize).join("");
};

export const toKebabCase = (input: string): string => {
  return splitWords(input).join("-");
};

export const toSnakeCase = (input: string): string => {
  return splitWords(input).join("_");
};

export const toConstantCase = (input: string): string => {
  return splitWords(input)
    .map((word) => word.toUpperCase())
    .join("_");
};
