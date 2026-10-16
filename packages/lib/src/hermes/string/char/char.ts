// ASCII 문자 분류 술어. 단일 문자를 받아 종류를 판별한다.
// 로캘/유니코드 영향 없이 항상 같은 결과를 주는 결정론적 분류용이라,
// 파싱·토크나이즈 같은 곳에서 정규식보다 가볍게 재사용한다.
// (빈 자리나 범위 밖 문자에는 false를 돌려줘 경계에서 안전하다.)

export const isAsciiUpper = (char: string): boolean => char >= "A" && char <= "Z";

export const isAsciiLower = (char: string): boolean => char >= "a" && char <= "z";

export const isAsciiDigit = (char: string): boolean => char >= "0" && char <= "9";

export const isAsciiLetter = (char: string): boolean => isAsciiUpper(char) || isAsciiLower(char);

export const isAsciiAlphanumeric = (char: string): boolean => isAsciiLetter(char) || isAsciiDigit(char);
