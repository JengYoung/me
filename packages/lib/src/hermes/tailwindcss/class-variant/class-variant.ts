import { type VariantProps, createTV } from "tailwind-variants";
import { type TWMergeConfig, twMergeConfig as defaultTwMergeConfig } from "../tw-merge-config/index";

export type { VariantProps };

export type ClassVariant = ReturnType<typeof createTV>;

/**
 * 지정한 tailwind-merge 설정을 사용하는 variant 기반 className 빌더를 만든다.
 */
export const createClassVariant = (twMergeConfig: TWMergeConfig = defaultTwMergeConfig): ClassVariant =>
  createTV({ twMergeConfig });

/**
 * `tailwind-variants`의 `tv`를 감싸 variant 기반 className 빌더를 만든다.
 *
 * `cn`과 동일한 {@link twMergeConfig}를 공유하므로 variant 병합 시에도 같은
 * Tailwind 충돌 규칙이 적용된다. 컴포넌트의 variant prop 타입은 `VariantProps`로
 * 추론할 수 있다.
 *
 * @example
 * const button = classVariant({
 *   base: "rounded font-medium",
 *   variants: {
 *     intent: { primary: "bg-blue-500 text-white", ghost: "bg-transparent" },
 *     size: { sm: "px-2 py-1", lg: "px-4 py-2" },
 *   },
 *   defaultVariants: { intent: "primary", size: "sm" },
 * });
 *
 * button({ intent: "ghost", size: "lg" });
 *
 * type ButtonVariants = VariantProps<typeof button>;
 */
export const classVariant = createClassVariant();
