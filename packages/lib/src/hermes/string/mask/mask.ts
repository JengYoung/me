export interface MaskOptions {
  /** 앞에서 그대로 남길 글자 수. 기본 1. */
  start?: number;
  /** 뒤에서 그대로 남길 글자 수. 기본 1. */
  end?: number;
  /** 가운데를 가릴 문자. 기본 "*". */
  char?: string;
}

// 앞 start글자와 뒤 end글자만 남기고 가운데를 char로 가린다. 입력은 변형하지 않는다.
// start + end가 길이 이상이면 가릴 가운데가 없으므로 원문을 그대로 반환한다.
//
// 길이 계산과 슬라이싱을 코드포인트 단위(`[...str]`)로 한다. str.length나 slice는
// 서로게이트 쌍(이모지 등)을 반쪽으로 세거나 쪼개므로, 사용자가 보는 "글자 수"와
// 어긋난다. 가운데 한 글자당 char 하나로 치환한다 (남는 글자 수만큼 char 반복).
export const mask = (str: string, options: MaskOptions = {}): string => {
  const { start = 1, end = 1, char = "*" } = options;

  const chars = [...str];
  const hiddenCount = chars.length - start - end;

  if (hiddenCount <= 0) {
    return str;
  }

  const head = chars.slice(0, start).join("");
  const tail = chars.slice(chars.length - end).join("");

  return head + char.repeat(hiddenCount) + tail;
};
