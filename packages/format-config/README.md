# @repo/format-config

Oxfmt용 공유 설정 패키지입니다. `@repo/format-config/react`를 `packages/ui`에서 사용합니다. 작은따옴표, 세미콜론, 공백 2칸, 너비 120을 기본으로 하고 JSX 속성은 큰따옴표로 유지합니다.

소비 패키지의 개발 의존성에 `@repo/format-config: workspace:*`와 `oxfmt`를 추가하고, `oxfmt.config.mts`에서 프리셋을 가져옵니다.

```ts
export { default } from '@repo/format-config/react';
```

기존 `.oxfmtrc.json` 또는 `.oxfmtrc.jsonc`와 같은 디렉터리에 두지 않습니다. 추가 제외 경로는 소비 패키지의 설정에서 확장합니다.

```ts
import { defineConfig } from 'oxfmt';
import react from '@repo/format-config/react';

export default defineConfig({
  ...react,
  ignorePatterns: [...react.ignorePatterns, 'src/generated/**'],
});
```

`pnpm --filter @repo/ui format`으로 포맷을 적용하고 `pnpm --filter @repo/ui format:check`로 확인합니다. 루트의 `pnpm format`과 `pnpm format:check`는 해당 스크립트를 가진 패키지를 Turborepo로 실행합니다. 쓰기 작업은 캐시하지 않으며, 검사는 공유 설정 패키지의 변경을 캐시 입력에 반영합니다.

현재 기준은 Oxfmt 0.73.0입니다. [공식 설정 문서](https://oxc.rs/docs/guide/usage/formatter/config.html)를 참고합니다.
