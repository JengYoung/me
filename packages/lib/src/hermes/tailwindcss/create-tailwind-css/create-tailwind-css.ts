import { type ClassVariant, createClassVariant } from "../class-variant/index";
import { type Cn, createCn } from "../cn/index";
import { type TWMergeConfig, twMergeConfig as defaultTwMergeConfig } from "../tw-merge-config/index";

export type TailwindCssHelpers = {
  cn: Cn;
  classVariant: ClassVariant;
};

/**
 * 지정한 tailwind-merge 설정을 공유하는 className helper 세트를 만든다.
 */
export const createTailwindCss = (twMergeConfig: TWMergeConfig = defaultTwMergeConfig): TailwindCssHelpers => ({
  cn: createCn(twMergeConfig),
  classVariant: createClassVariant(twMergeConfig),
});
