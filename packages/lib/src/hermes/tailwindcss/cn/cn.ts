import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import { type TWMergeConfig, twMergeConfig as defaultTwMergeConfig } from "../tw-merge-config/index";

export type Cn = (...inputs: ClassValue[]) => string;

export type { ClassValue };

/**
 * 지정한 tailwind-merge 설정을 사용하는 `cn` 함수를 만든다.
 */
export const createCn = (twMergeConfig: TWMergeConfig = defaultTwMergeConfig): Cn => {
  const twMerge = extendTailwindMerge<string, string>(twMergeConfig);

  return (...inputs) => twMerge(clsx(inputs));
};

/**
 * 조건부 className을 합치고 충돌하는 Tailwind 클래스를 정리한다.
 *
 * `clsx`로 문자열, 배열, 객체 형태의 입력을 하나의 문자열로 합친 뒤
 * `tailwind-merge`로 같은 속성을 다투는 클래스 중 뒤에 온 값만 남긴다.
 * 병합 동작은 {@link twMergeConfig}를 따르며 `classVariant`와 설정을 공유한다.
 *
 * @example
 * cn("px-2 py-1", "px-4"); // "py-1 px-4"
 * cn("text-sm", { "font-bold": isActive });
 */
export const cn = createCn();
