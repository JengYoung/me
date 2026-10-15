# @repo/lint-config

Oxlint용 공유 설정 패키지입니다. `@repo/lint-config/react`는 React·TypeScript·JSX 접근성 규칙을 제공하며 `packages/ui`에서 사용합니다.

소비 패키지의 개발 의존성에 `@repo/lint-config: workspace:*`와 `oxlint`를 추가하고, `oxlint.config.mts`에서 프리셋을 가져옵니다.

```ts
export { default } from '@repo/lint-config/react';
```

기존 `.oxlintrc.json`과 같은 디렉터리에 두지 않습니다. 패키지별 설정을 추가하려면 프리셋을 펼쳐 필요한 값을 덮어씁니다.

```ts
import { defineConfig } from 'oxlint';
import react from '@repo/lint-config/react';

export default defineConfig({
  ...react,
  rules: {
    ...react.rules,
    'no-console': 'warn',
  },
});
```

Oxlint의 `extends`는 상속하는 속성이 제한되어 있으므로, 객체를 직접 가져와 `categories`, `env`, `ignorePatterns`까지 적용합니다. Next.js 전용 규칙이나 특정 저장소 경로는 React 프리셋에 포함하지 않습니다.

현재 기준은 Oxlint 1.88.0입니다. [공식 설정 공유 문서](https://oxc.rs/docs/guide/usage/linter/nested-config.html)를 참고합니다.
