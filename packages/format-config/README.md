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

공유 설정은 의존성·빌드/생성물·lockfile을 제외하고, import 정렬과 Tailwind 클래스 정렬을 명시적으로 비활성화합니다. `packages/ui/oxfmt.config.mts`는 Iris 코어인 `src/base/**`를 추가로 제외합니다. 코어를 제외하려면 UI의 소비 설정을 사용해야 하며, 공유 프리셋을 직접 지정해 이 예외를 우회하지 않습니다.

현재 루트 포맷 명령은 `@repo/ui`에만 적용됩니다. 앱·다른 패키지·스크립트 파일은 별도 범위 검사가 필요하며, 루트 명령 통과를 전체 저장소 포맷 검사로 해석하지 않습니다. AI 작업 정책의 원천은 `.agent-source/conventions/code-quality/source.md`입니다.

현재 기준은 Oxfmt 0.73.0입니다. [공식 설정 문서](https://oxc.rs/docs/guide/usage/formatter/config.html)를 참고합니다.
