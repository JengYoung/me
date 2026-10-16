import type { TWMergeConfig } from "tailwind-variants";

export type { TWMergeConfig };

/**
 * `cn`과 `classVariant`가 함께 사용하는 tailwind-merge 설정.
 *
 * 프로젝트 고유 Tailwind 토큰(커스텀 색상, spacing, classGroup 등)을 여기에
 * 추가하면 `cn`의 충돌 정리와 `classVariant`의 variant 머지에 동시에 반영된다.
 * 기본값은 빈 설정이며 이 경우 tailwind-merge 기본 동작을 그대로 따른다.
 *
 * @see https://github.com/dcastil/tailwind-merge/blob/main/docs/configuration.md
 */
export const twMergeConfig: TWMergeConfig = {};
