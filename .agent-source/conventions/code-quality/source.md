# 코드 품질 도구 정책

이 문서는 lint, 포맷팅, 타입 검사의 책임과 Iris 코어의 적용 예외를 정의하는 공통 원천이다. 실제 규칙과 적용 범위는 각 패키지의 설정 및 스크립트와 함께 유지한다.

## 도구의 책임

- JavaScript·TypeScript 정적 분석은 Oxlint로 실행한다. React·Next.js·접근성·import·FSD 검사도 같은 실행 경로를 사용한다.
- 코드 포맷팅과 포맷 검사는 Oxfmt로 실행한다. 들여쓰기, 따옴표, 세미콜론, 줄바꿈은 lint 규칙으로 중복 관리하지 않는다.
- 타입 정확성은 TypeScript compiler로 검사한다. lint 통과를 타입 검사 통과로 보고하지 않는다.
- ESLint CLI, Prettier, Biome를 별도 품질 검사나 포맷터로 병행하지 않는다. 호환 JS 플러그인은 Oxlint 안에서만 실행한다.
- 오래 유지할 정책은 이 원천과 도구별 생성 지침에 둔다. README만 고쳐 AI가 해당 정책을 따를 것으로 가정하지 않는다.

## Iris 코어 예외

- `packages/ui/src/base/**`는 저장소의 스타일·구조 컨벤션 적용 예외다. 취향이나 형식 차이만으로 코드를 일괄 수정하거나 리뷰 결함으로 판단하지 않는다.
- 이 경로는 `packages/ui/oxfmt.config.mts`에서 `src/base/**`로 제외한다. 다른 설정을 직접 지정하거나 ignore를 우회하여 포맷하지 않는다.
- Oxlint와 타입 검사에서는 코어를 제외하지 않는다. correctness, 타입 정확성, 실제 동작과 접근성 문제의 검증은 유지한다.
- 현재 React 프리셋은 correctness 중심이며 style 카테고리를 켜지 않는다. 스타일 규칙을 추가할 때는 `packages/ui/oxlint.config.mts`의 해당 경로 override에서 그 규칙만 끈다. 전체 lint 제외나 correctness 비활성화로 예외를 구현하지 않는다.
- 코어를 수정해야 하는 기능·오류 해결 요청은 필요한 부분만 변경하고 해당 동작을 검증한다. 주변의 형식·구조 정리는 섞지 않는다.

## Oxlint 설정

- 공유 React 정책은 `packages/lint-config/react.js`, Next.js 정책은 `packages/lint-config/next.js`, FSD 플러그인은 `packages/lint-config/fsd/`에서 관리한다.
- 소비 패키지는 자신의 `oxlint.config.mts`에서 공유 프리셋을 가져온다. 현재 소비자는 `packages/ui`, `apps/web`, `apps/docs`다.
- 새 검사는 설치된 Oxlint의 네이티브 규칙을 먼저 확인한다. 같은 검사를 네이티브 규칙과 호환 JS 플러그인으로 중복 실행하지 않는다.
- 현재 Next.js 프리셋의 `next-compat`, `hooks-compat`, `turbo` 플러그인은 네이티브 규칙이 없는 검사에 사용한다. 플러그인 패키지명에 ESLint가 있어도 ESLint CLI나 설정 파일을 추가하지 않는다.
- unused-vars도 Oxlint로 검사한다. `_` 접두어 같은 예외가 필요하면 해당 규칙의 옵션에 명시하며 이름만으로 예외가 적용된다고 가정하지 않는다.
- FSD 계층·공개 API·슬라이스 구조 규칙은 현재 `error`다. 경고 수준이나 예외 범위를 의도 없이 완화하지 않는다.
- Next.js의 `rootDir`에는 앱의 파일 시스템 경로를 전달한다. 설정 파일의 `import.meta.dirname`을 사용하며, `.mts` 파일도 앱 타입 검사에 포함한다.
- 플러그인·프리셋 변경은 `pnpm --filter @repo/lint-config test`로 검증한다. 경로 관련 변경은 실제 Oxlint CLI에서 설정 로딩과 진단을 확인한다. 진단 없는 실행만으로 규칙이 동작한다고 판단하지 않는다.

## Oxfmt 설정

- 공유 포맷 정책은 `packages/format-config/react.js`, UI 적용 범위는 `packages/ui/oxfmt.config.mts`에서 관리한다.
- 기본값은 공백 2칸, 작은따옴표, JSX 속성 큰따옴표, 세미콜론, 너비 120이다. 구체적인 옵션은 설정 파일을 기준으로 한다.
- 의존성, 빌드·생성물, lockfile과 Iris 코어는 포맷 대상에서 제외한다. 소스 루트와 실행 위치에 맞는 제외 패턴을 사용한다.
- `sortImports`와 `sortTailwindcss`는 비활성화한다. import·Tailwind 클래스 정렬을 일반 포맷 변경에 암묵적으로 섞지 않는다.
- 검사에는 `pnpm format:check`, 수정에는 `pnpm format`을 사용한다. 수정은 요청한 파일·패키지 범위로 제한하며 관련 없는 변경을 섞지 않는다.
- 현재 루트 포맷 명령은 스크립트가 있는 `@repo/ui`만 실행한다. 앱·다른 패키지·스크립트까지 검사했다고 보고하지 않는다. 다른 범위는 Oxfmt에 대상 파일과 설정을 명시하거나 필요한 패키지 스크립트를 먼저 구성한다.

## 타입 검사와 검증 범위

- 루트 타입 검사 명령은 `pnpm check-types`다. 패키지의 `tsc --noEmit`을 실행하며, Next.js 앱은 먼저 `next typegen`을 실행한다.
- 루트 lint 명령은 `pnpm lint`다. 자동 수정은 해당 패키지의 `lint:fix`를 사용하고 diff를 검토한다.
- 루트 작업은 해당 스크립트를 선언한 패키지에만 적용된다. 예를 들어 `packages/lib`에 검사 스크립트가 없으면 루트 검사만으로 해당 패키지까지 검증했다고 보고하지 않는다.
- 변경과 관련된 검사부터 실행하고, 실제 수행한 범위와 결과를 보고한다. 기존 실패, 새 실패, 미실행 항목을 구분하며 실패를 숨기기 위해 규칙을 끄거나 승인 절차를 우회하지 않는다.

## 정책 변경

1. 도구 책임이나 적용 예외를 바꾸면 이 원천을 수정한다.
2. 현재 프로젝트의 프리셋·패키지 설정·스크립트를 정책에 맞춘다. 도구별 로딩과 실행 방식 변경은 해당 어댑터에 반영한다.
3. 지침 동기화로 Codex·Claude 산출물을 함께 생성하고 정합성을 검사한다. 생성물은 직접 수정하지 않는다.
4. 변경한 설정의 lint·포맷·타입 검사와 필요한 실행 검증을 수행한다. 지침 정합성 검사는 코드 검증을 대체하지 않는다.

품질 도구의 적용 범위를 바꿨다면 `node --test scripts/code-quality.test.mjs`로 Iris 포맷 제외, 외부 소스 포맷 적용, 정렬 보존, 코어 correctness 검사의 실제 CLI 동작을 확인한다.
