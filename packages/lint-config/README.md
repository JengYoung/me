# @repo/lint-config

Oxlint용 공유 설정과 FSD·Plugin 생명주기 플러그인 패키지입니다.

| 진입점                               | 용도                                 | 적용 대상                              |
| ------------------------------------ | ------------------------------------ | -------------------------------------- |
| `@repo/lint-config/react`            | React·TypeScript·JSX 접근성          | `packages/ui`                          |
| `@repo/lint-config/next`             | Next.js·React·Turborepo 환경변수·FSD | `apps/web`, `apps/docs`                |
| `@repo/lint-config/fsd`              | FSD 플러그인과 설정 생성 함수        | FSD 정책을 별도로 구성하는 패키지      |
| `@repo/lint-config/plugin-lifecycle` | Plugin의 단일 effect와 cleanup 구조  | 프로젝트에서 정의한 `*Plugin` 컴포넌트 |

Node.js 24 이상을 사용합니다. FSD 플러그인은 이 패키지의 `fsd/`에 있으며, TypeScript 소스를 Node.js의 타입 제거 기능으로 직접 실행합니다.

## React

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

Oxlint의 `extends`는 상속하는 속성이 제한되어 있으므로, 객체를 직접 가져와 `categories`, `env`, `ignorePatterns`까지 적용합니다. React 프리셋에는 Plugin 생명주기 규칙이 포함됩니다. Next.js 규칙과 FSD 플러그인은 React 프리셋에 포함하지 않습니다.

`packages/ui/src/base/**`의 Iris 코어는 스타일·구조 컨벤션 적용 예외입니다. UI 설정의 해당 경로 override에서 `plugin-lifecycle/single-effect`만 끕니다. 현재 프리셋은 correctness 중심이고 style 카테고리는 활성화하지 않습니다. 향후 스타일 규칙을 추가할 때도 해당 규칙만 끄며, 코어를 lint 전체에서 제외하지 않습니다. correctness·타입·동작 검증은 유지하고, 포맷 제외는 `packages/ui/oxfmt.config.mts`에서 관리합니다. AI 작업 정책의 원천은 `.agent-source/conventions/code-quality/source.md`입니다.

## Next.js

소비 앱에 `@repo/lint-config: workspace:*`와 `oxlint`를 개발 의존성으로 추가하고, `oxlint.config.mts`를 만듭니다.

```ts
import { createNextConfig } from '@repo/lint-config/next';

export default createNextConfig({ rootDir: import.meta.dirname });
```

앱의 `tsconfig.json`은 `include`에 `**/*.mts`를 포함하고, `compilerOptions`에 `allowImportingTsExtensions: true`를 설정합니다. `noEmit`과 함께 공유 FSD 플러그인의 `.ts` 소스를 검사하며, 앱의 `@types/node`로 설정 파일의 `import.meta.dirname` 타입도 확인합니다. `rootDir`에는 파일 시스템 경로를 전달합니다. `import.meta.resolve('./')`의 반환값은 `file:` URL이므로 그대로 전달하지 않습니다.

`lint` 스크립트는 `oxlint --max-warnings 0 .`, `lint:fix`는 `oxlint --fix --max-warnings 0 .`을 사용합니다. `rootDir`를 설정 파일 위치에 고정하므로, 앱 안에서 실행하거나 저장소 루트에서 `--config`로 지정해도 같은 FSD 경로를 검사합니다. `.next`, `out`, `next-env.d.ts` 등 생성물은 제외합니다.

기존 Next.js Core Web Vitals와 React Hooks 권장 규칙을 Oxlint의 네이티브 규칙으로 매핑했습니다. Oxlint 1.88.0에 없는 아래 규칙은 `jsPlugins`로 실행합니다. ESLint CLI는 실행하지 않습니다.

- `next-compat/no-location-assign-relative-destination`
- `hooks-compat/config`, `hooks-compat/gating`
- `turbo/no-undeclared-env-vars`

호환 플러그인은 기존 버전인 `@next/eslint-plugin-next` 16.3.4, `eslint-plugin-react-hooks` 7.1.1, `eslint-plugin-turbo` 2.10.12를 사용합니다. 프리셋이 플러그인 위치를 직접 해석하므로 소비 앱에 이 플러그인을 중복 선언할 필요가 없습니다.

### Next.js에서의 FSD 정책

- 기본 계층은 낮은 순서로 `shared → entities → features → widgets → screens → app`입니다. FSD 화면 계층은 Next.js의 `pages` 라우터와 구분해 `screens`로 둡니다.
- 기본 소스 루트는 앱의 `src`와 앱 루트입니다. 루트 `app/`과 `src/app/` 양쪽의 라우트에서 FSD 공개 API 사용을 검사합니다. 기본 `@/`와 `~/` 별칭은 `src/`를 가리킵니다.
- `app` 내부는 Next.js 파일 규약을 따르므로 구조와 공개 진입점 요구에서 제외합니다. 하위 계층에서 `app`으로 향하는 import는 여전히 금지합니다.
- 같은 계층의 다른 슬라이스 import는 금지하며, `entities/<slice>/@x/<사용하는 슬라이스>`의 명시적 교차 API는 허용합니다.
- `entities`, `features`, `widgets`, `screens`의 `<slice>/index.ts`는 자기 슬라이스의 구현과 타입을 재수출할 수 있습니다. 예를 들어 `features/auth/index.ts`의 `export { login } from './model/login'`은 허용합니다. 다른 슬라이스가 이 내부 경로를 직접 가져오거나 재수출하는 것은 금지합니다. 단독 FSD 설정의 `pages`에도 같은 원칙을 적용합니다.
- `shared/ui`와 `shared/lib`는 각 모듈의 공개 API를 허용합니다. 예를 들어 `@/shared/ui/button`은 허용하고 외부에서 `@/shared/ui/button/button`을 가져오면 실패합니다.
- 같은 소스 루트의 `shared/ui/index.ts`, `shared/lib/index.ts`는 자신이 포함하는 하위 모듈의 구현을 직접 재수출해 세그먼트 공개 API를 구성할 수 있습니다. 예를 들어 `shared/ui/index.ts`의 `export { Header } from './layout/header'`는 허용합니다. 이 예외는 설정된 공개 진입점의 직접 재수출에만 적용하며, 일반 import·다른 세그먼트·형제 모듈·다른 소스 루트의 내부 접근은 허용하지 않습니다. `publicApiFiles`와 `sharedModuleSegments`를 변경한 경우에도 같은 경계로 판정합니다.

앱별 루트, 별칭, 계층은 `fsd` 옵션으로 바꿉니다. 별칭 대상은 해당 소스 루트 기준의 경로입니다.

```ts
import { createNextConfig } from '@repo/lint-config/next';

export default createNextConfig({
  rootDir: import.meta.dirname,
  fsd: {
    roots: [{ path: 'src', aliases: { '@entities': 'entities', '@features': 'features' } }],
    ignore: ['shared/lib/generated'],
  },
});
```

`ignore`는 glob이 아닌 소스 루트 기준의 파일·디렉터리 접두사입니다. `ignoreLayers`는 구조 검사만, `publicApiIgnoreLayers`는 대상 계층의 공개 API 검사만 생략합니다. 계층 방향 검사에는 영향을 주지 않습니다.

## FSD 플러그인 단독 사용

```ts
import { defineConfig } from 'oxlint';
import react from '@repo/lint-config/react';
import { createConfig } from '@repo/lint-config/fsd';

const fsd = createConfig({ roots: ['src'] });

export default defineConfig({
  ...react,
  jsPlugins: [...react.jsPlugins, ...fsd.jsPlugins],
  rules: { ...react.rules, ...fsd.rules },
});
```

단독 사용의 상대 루트는 실행 디렉터리를 기준으로 해석합니다. 일반 FSD 기본 계층은 `pages`를 사용하며, Next.js의 `screens` 정책은 Next.js 프리셋에서만 적용합니다. `configs.recommended`와 기존 Hermes 옵션을 유지한 `configs.hermes`도 제공합니다.

| 규칙                     | 검사 내용                                     |
| ------------------------ | --------------------------------------------- |
| `fsd/fsd-layer-imports`  | 상위 계층 의존과 같은 계층의 슬라이스 간 의존 |
| `fsd/fsd-public-api`     | 다른 슬라이스·모듈의 내부 구현 직접 접근      |
| `fsd/fsd-slice-segments` | 슬라이스·세그먼트 구조와 공개 진입점          |

정적 import, 재수출, 문자열 동적 import, TypeScript의 `import()` 타입을 검사합니다. 경로는 설정한 별칭과 상대 경로로 판정하며, `tsconfig.paths`를 자동으로 읽거나 실제 파일 존재를 검사하지 않습니다. 계산된 동적 경로와 CommonJS `require()`는 분석하지 않습니다.

플러그인은 Oxlint의 `createOnce` API를 사용하며, 파일마다 경로와 옵션 상태를 초기화합니다. 원본의 ISC 고지는 [fsd/LICENSE](fsd/LICENSE)에 보존합니다.

## Plugin의 단일 effect

`plugin-lifecycle/single-effect`는 **프로젝트 소스에서 직접 정의한, 이름이 대문자로 시작하고 `Plugin`으로 끝나는 함수 컴포넌트**에 적용합니다. `ScrollHeaderPlugin`, `SidebarPlugin`, `FocusPlugin` 모두 같은 규칙을 따릅니다. 공유 React 프리셋에 등록되어 `apps/web`, `apps/docs`, `packages/ui`에 공통 적용되며, 앱별 등록은 필요하지 않습니다.

외부에서 import·재수출한 Plugin이나 외부 컴포넌트를 `memo`로 감싼 참조의 구현은 검사하지 않습니다. `node_modules` 경로는 규칙 자체에서 제외하므로 Git ignore나 CLI 대상 지정에 의존하지 않습니다. Iris 코어는 위의 UI override로 이 규칙만 제외합니다. `Header`, `PluginProvider`처럼 suffix가 다른 컴포넌트와 `scrollHeaderPlugin` 같은 소문자 설치 함수도 대상이 아닙니다. `HeaderPlugin`·`HeaderPluginProps` 같은 **타입 이름으로 검사 대상을 추가하지 않습니다.**

검사하는 구조는 다음과 같습니다.

- 컴포넌트 본문의 최상위 문장에서 React `useEffect`를 정확히 하나 호출해야 합니다. 0개와 2개 이상 모두 오류입니다.
- `useLayoutEffect`, `useInsertionEffect`, 별도 구독 생명주기를 만드는 `useSyncExternalStore` 호출은 허용하지 않습니다.
- 커스텀 Hook 호출은 내부 effect 수를 확인할 수 없으므로 허용하지 않습니다. `useState`, `useRef`, `useMemo` 같은 나머지 React Hook과 일반 함수 호출은 허용합니다.
- effect는 동기 콜백이어야 하며, cleanup으로 사용할 값을 반환하는 구문이 있어야 합니다. `return () => stop()`, `return cleanup`, `return install(header)`와 `() => install(header)`를 허용합니다. ref가 없을 때의 조기 `return`은 허용합니다.
- 같은 파일의 로컬 callback은 선언을 찾아 검사합니다. 외부 callback을 `useEffect(install, [])`로 직접 전달하면 설치와 정리가 드러나도록 `useEffect(() => install(), [])`로 작성해야 합니다.

React import 별칭, default·namespace import, 문자열 멤버 접근, `const` 별칭과 구조 분해를 추적합니다. 같은 이름의 지역 변수를 React Hook으로 오인하지 않습니다. 함수 선언·화살표 함수·함수 표현식과 React `memo`·`forwardRef`에 직접 전달한 함수 구현을 지원하고, 컴포넌트별로 개수를 셉니다.

```tsx
export function ScrollHeaderPlugin({ headerRef }: HeaderPluginProps) {
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    return scrollHeaderPlugin(header);
  }, [headerRef]);

  return null;
}
```

설치·계산·정리의 공통 함수는 자유롭게 분리할 수 있습니다. 의존성과 Hook 호출 순서 검사는 기존 `react/exhaustive-deps`와 `react/rules-of-hooks`가 함께 담당합니다. effect를 자동으로 합치면 의존성과 정리 순서가 달라질 수 있으므로 자동 수정은 제공하지 않습니다.

이 규칙은 AST 구조를 검사합니다. 반환한 식이 실제로 cleanup 함수인지, 모든 실행 경로에서 구독을 해제하는지, 일반 함수 안에 숨긴 부수 효과나 자식 컴포넌트의 effect까지 하나인지는 보장하지 않습니다. `use` + 대문자·숫자라는 Hook 명명 규약을 벗어난 외부 함수, CommonJS·동적 import, 계산된 멤버 이름을 추적하는 전체 프로그램 분석은 수행하지 않습니다. **스크롤보다 포커스를 우선하는 판단과 실제 이벤트 정리는 별도의 동작 검증이 필요합니다.**

## 검증과 버전

```sh
pnpm --filter @repo/lint-config test
pnpm --filter @repo/lint-config check-types
pnpm lint
```

Oxlint와 `@oxlint/plugins` 1.88.0을 기준으로 검증합니다. JS 플러그인 API는 alpha 상태이므로 업그레이드 시 규칙 테스트와 실제 CLI 통합 테스트를 함께 실행합니다. `lint-config`의 파일 변경은 워크스페이스 의존성과 `^lint`를 통해 소비 앱의 Turborepo 캐시 입력에 반영됩니다.

공식 문서: [설정 공유](https://oxc.rs/docs/guide/usage/linter/nested-config.html), [JS 플러그인](https://oxc.rs/docs/guide/usage/linter/js-plugins.html), [플러그인 작성·테스트](https://oxc.rs/docs/guide/usage/linter/writing-js-plugins.html).
