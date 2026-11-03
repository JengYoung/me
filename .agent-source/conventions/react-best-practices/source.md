# React·Next.js 작성 및 성능 지침

## 근거와 적용 범위

[Vercel Engineering의 React Best Practices](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices)를 이 프로젝트의 작성·수정·리뷰 계약으로 적용한다. React 컴포넌트·Hook, Next.js 페이지·라우트, 데이터 조회, 서버/클라이언트 경계, 번들·렌더링 성능 작업에서 읽는다. React와 무관한 Node 스크립트에 React 전용 패턴을 적용하지 않는다.

- 기준 원문은 2026-10-20에 확인한 커밋 `063bee94c3f4df8453406c830b0a7df0f2860278`이다. [SKILL.md](https://github.com/vercel-labs/agent-skills/blob/063bee94c3f4df8453406c830b0a7df0f2860278/skills/react-best-practices/SKILL.md)는 버전 `1.0.0`, 작성자 `vercel`, 라이선스 `MIT`를 명시한다.
- 아래 내용은 원문의 8개 분야·70개 규칙을 한국어로 요약하고 프로젝트 제약과 공식 API 계약에 맞게 보정한 적용 지침이다. 원문 전체나 코드 예시를 그대로 복제한 문서가 아니다.
- 각 식별자는 [고정된 원문의 rules 디렉터리](https://github.com/vercel-labs/agent-skills/tree/063bee94c3f4df8453406c830b0a7df0f2860278/skills/react-best-practices/rules)의 `<식별자>.md`와 대응한다. 구체적인 예시·전제는 관련 규칙 파일 또는 [전체 문서](https://github.com/vercel-labs/agent-skills/blob/063bee94c3f4df8453406c830b0a7df0f2860278/skills/react-best-practices/AGENTS.md)를 확인한다. 원문을 조회하지 못하면 확인 범위를 구분하고 기억으로 예시를 만들어 원문처럼 인용하지 않는다.
- 업스트림 갱신은 변경된 규칙과 아래 보정 사항을 검토한 뒤 원천의 기준 커밋·내용을 함께 수정하고 재생성한다. `main`의 변경을 자동 승인하거나 생성 파일만 고치지 않는다.

## 프로젝트에서 적용하는 기준

1. 현재 요청의 동작·접근성·보안·타입 정확성을 먼저 보존한다. 성능 수치나 범용 예시만으로 관련 없는 코드를 일괄 리팩터링하지 않는다. 네트워크 직렬 대기와 초기 번들을 먼저 확인하고, 미세 최적화는 실제 병목이나 명확한 비용 근거가 있을 때 적용한다.
2. 대상 `package.json`, lockfile, Next.js 설정과 React Compiler 활성 여부를 확인한다. 확인 당시 `apps/web`, `apps/docs`, `packages/ui`는 React `19.2.8`, 두 앱은 Next.js `16.3.8`을 사용하며 앱 설정에 React Compiler 활성화는 없다. 이후 작업은 이 기록보다 실제 설치 버전을 우선한다.
3. 원문의 SWR, `better-all`, LRU, SVGO는 구현 예시다. 설치된 기능과 표준 API를 먼저 사용하며, 지침 준수만을 위해 의존성·캐시 계층·빌드 설정을 추가하지 않는다. React·Next.js 전용 API를 공유 라이브러리에 넣을 때는 실행 환경과 패키지 경계를 확인한다.
4. FSD 공개 API와 같은 레이어의 슬라이스 간 import 제한을 유지한다. `bundle-barrel-imports`를 이유로 앱 내부의 비공개 경로나 `@repo/ui` 내부 파일을 직접 import하지 않는다. 외부 패키지는 공식 export·타입이 있는 subpath 또는 설치 버전에서 지원하는 import 최적화를 검토한다. 공개 API의 비용이 확인되면 공개 진입점 자체를 설계한다.
5. Oxlint·Oxfmt·TypeScript의 책임은 기존 코드 품질 계약을 따른다. 이 문서는 AI의 작성·리뷰 지침이며 자동 lint 규칙을 추가한 것이 아니다. 원문에 ESLint가 등장해도 ESLint CLI·설정을 새로 병행하지 않는다.
6. Figma 정본의 디자인 토큰과 `mobile:`·`desktop:` 경계는 그대로 적용한다. 원문의 CSS·SVG·inline style 예시는 미등록 시각 값을 사용할 근거가 아니다. Iris 코어 `packages/ui/src/base/**`의 스타일·구조 컨벤션 및 포맷 예외를 유지하며 correctness·타입·동작 문제는 검증한다.
7. Hook은 React의 호출 규칙을 따른다. 주입받은 Hook 함수를 조건부로 실행하거나 렌더마다 교체하지 않는다. 컴포넌트는 JSX로 렌더링하고, effect의 구독·타이머·DOM 변경은 해당 effect가 정리한다. 최적화 때문에 의존성 검사나 Strict Mode를 끄지 않는다.

## 적용 우선순위

| 순서 | 분야                   | 원문 영향도 | 우선 확인할 비용                  |
| ---- | ---------------------- | ----------- | --------------------------------- |
| 1    | 비동기 직렬 대기 제거  | CRITICAL    | 불필요한 await와 요청 간 의존성   |
| 2    | 번들 크기              | CRITICAL    | 초기 화면에 필요 없는 코드·데이터 |
| 3    | 서버 성능              | HIGH        | 서버 조회·캐시·직렬화·요청 격리   |
| 4    | 클라이언트 데이터 조회 | MEDIUM-HIGH | 중복 요청·구독·동기 저장소 접근   |
| 5    | 재렌더링               | MEDIUM      | 상태·effect·구독·비싼 계산        |
| 6    | 렌더링                 | MEDIUM      | hydration·레이아웃·화면 밖 콘텐츠 |
| 7    | JavaScript             | LOW-MEDIUM  | 반복 조회·순회·DOM 읽기와 쓰기    |
| 8    | 고급 패턴              | LOW         | 구독 수명과 최신 값 접근          |

영향도는 검토 순서이며 모든 코드에 기법을 적용하라는 뜻이 아니다. 인증·요청 격리·Hook 호출 오류는 순서와 관계없이 correctness 문제로 다룬다.

## 1. 비동기 직렬 대기 제거

- `async-cheap-condition-before-await`: 값이 싸고 부작용 없는 동기 조건으로 요청을 생략할 수 있으면 먼저 검사한다. 의존성·권한 확인·부작용 순서를 바꾸지 않는다.
- `async-defer-await`: 실제로 값이 필요한 분기에서 기다린다. 값을 사용하지 않는 경로까지 느린 조회가 막지 않게 한다.
- `async-parallel`: 서로 독립적인 작업은 함께 시작하고 `Promise.all` 등 요구하는 실패 처리에 맞는 방법으로 모은다. 병렬 시작 자체가 취소나 오류 처리를 제공한다고 가정하지 않는다.
- `async-dependencies`: 부분 의존성은 Promise 연결로 표현해 선행 결과가 준비된 작업부터 진행한다. 모든 선행 작업의 완료를 불필요하게 기다리지 않는다.
- `async-api-routes`: Route Handler·Server Action에서도 독립 조회는 일찍 시작하고 필요한 지점에서 기다린다. 인증·인가에 의존하는 조회·변경을 그 검증보다 앞서 실행하지 않는다.
- `async-suspense-boundaries`: 느린 콘텐츠에 적절한 Suspense 경계를 두어 준비된 화면을 먼저 보여준다. SEO에 필요한 콘텐츠, fallback의 크기·접근성, 레이아웃 이동과 오류 경계를 함께 확인한다.

## 2. 번들 크기

- `bundle-barrel-imports`: 큰 재수출 진입점이 실제로 가져오는 비용을 확인한다. 공개 API를 유지하면서 공식 subpath·패키지 import 최적화로 불필요한 모듈 로딩을 줄인다.
- `bundle-analyzable-paths`: 동적 import와 서버 파일 경로는 가능한 모듈 집합을 빌드 도구가 알 수 있게 리터럴이나 명시적 매핑으로 작성한다.
- `bundle-dynamic-imports`: 초기 화면에 필요 없는 무거운 컴포넌트는 적절한 경계에서 지연 로딩한다. Next.js에서는 `next/dynamic`의 실행 위치와 SSR 제약을 확인하고 무조건 `ssr: false`를 붙이지 않는다.
- `bundle-defer-third-party`: 초기 상호작용에 필요 없는 분석·로깅 코드는 이후에 로드한다. 필수 오류 수집이나 기능이 언제부터 동작해야 하는지는 보존한다.
- `bundle-conditional`: 큰 데이터·기능은 실제 활성화 시점에 로드한다. 비동기 완료 전에 기능이 꺼지거나 컴포넌트가 제거되는 경우도 처리한다.
- `bundle-preload`: hover·focus 등 사용 의도가 드러난 시점의 선행 로딩을 검토한다. 모든 기능을 미리 로드해 초기 번들 절감 효과를 없애지 않는다.

`typeof window` 조건만으로 서버 번들에서 모듈이 제외됐다고 판단하지 않는다. 클라이언트 경계와 빌드 산출물에서 실제 포함 범위를 확인한다.

## 3. 서버 성능과 요청 격리

- `server-auth-actions`: Server Action은 직접 호출 가능한 서버 진입점으로 다룬다. 진입점에서 입력·인증·인가를 검증하고 화면이나 layout의 검사만 믿지 않는다.
- `server-cache-react`: Server Component의 같은 요청 안에서 반복되는 DB 조회·계산 등에 `React.cache`를 검토한다. memoized 함수와 인자의 참조를 일관되게 유지하고 요청 간 영속 캐시로 간주하지 않는다.
- `server-cache-lru`: 요청 간 캐시가 필요한 경우에만 크기·TTL·무효화·키의 사용자/tenant 구분을 정한다. 프로세스 메모리 캐시는 여러 인스턴스에서 공유되거나 영속한다고 가정하지 않는다.
- `server-dedup-props`: 같은 데이터를 여러 Client Component에 전달하면서 불필요한 복사·파생 배열을 중복 직렬화하지 않는다. 필요한 필드만 전달하는 것과 클라이언트 계산 비용을 함께 비교한다.
- `server-hoist-static-io`: 모든 요청에 동일한 불변 자산의 I/O만 모듈 범위 재사용을 검토한다. 큰 메모리 점유, 초기 로딩 실패·재시도, 런타임 파일 변경 여부를 확인한다.
- `server-no-shared-module-state`: 사용자·요청별 데이터를 서버 모듈의 가변 전역 값에 저장하지 않는다. 동시 요청이 섞이지 않게 인자·props·요청 범위 저장소로 전달한다.
- `server-serialization`: 서버에서 클라이언트로 실제 필요한 직렬화 가능한 값만 전달한다. 비밀값·서버 전용 데이터는 넘기지 않고 Client Component 경계를 필요한 곳으로 좁힌다.
- `server-parallel-fetching`: 부모의 불필요한 await 때문에 독립된 자식 조회가 늦게 시작되지 않도록 데이터 조회와 컴포넌트 구성을 조정한다.
- `server-parallel-nested-fetching`: 항목별 선행 조회와 후속 조회를 각각 연결해 느린 한 항목이 다른 항목의 후속 조회를 막지 않게 한다. API·DB의 동시 실행 한도도 고려한다.
- `server-after-nonblocking`: 응답 완료에 필요하지 않은 후속 작업에만 지원되는 `after()`를 검토한다. 응답이 보장해야 할 저장·권한 확인을 뒤로 미루거나 내구성 있는 작업 큐로 취급하지 않는다.

Next.js의 fetch 메모이제이션·캐시 기본값과 적용 범위는 설치 버전 및 호출 위치에서 확인한다. 모든 fetch·Route Handler에 같은 캐시가 자동 적용된다고 가정하지 않는다.

## 4. 클라이언트 데이터 조회와 구독

- `client-swr-dedup`: 같은 데이터의 요청·캐시·재검증을 기존 데이터 조회 계층에서 공유한다. SWR이 설치되어 있지 않으면 이 규칙만으로 도입하지 않는다.
- `client-event-listeners`: 같은 전역 이벤트 구독이 여러 인스턴스에 중복되는지 확인한다. 공유 시에는 구독자별 callback과 마지막 구독자의 해제 책임을 유지한다.
- `client-passive-event-listeners`: `preventDefault`가 필요 없는 wheel·touch 관찰은 passive listener를 검토한다. 스크롤 잠금·제스처처럼 기본 동작 취소가 필요한 listener에는 적용하지 않는다.
- `client-localstorage-schema`: 저장소에는 필요한 비민감 필드만 버전이 있는 구조로 저장한다. 읽기·쓰기·파싱 실패와 이전 구조를 처리하며 SSR에서 브라우저 저장소를 읽지 않는다.

## 5. 상태·effect·재렌더링

- `rerender-defer-reads`: 이벤트 실행 때만 필요한 값 때문에 컴포넌트를 불필요하게 구독시키지 않는다. 화면에 표시되는 값은 반응성을 유지한다.
- `rerender-memo`: 비용이 큰 하위 렌더·계산을 식별한 뒤 분리와 memoization을 검토한다. props 안정성과 React Compiler 여부를 확인하며 `memo`·`useMemo`·`useCallback`을 기본 장식처럼 추가하지 않는다.
- `rerender-memo-with-default-value`: 참조 비교에 영향을 주는 기본 배열·객체·함수는 의미가 변하지 않을 때만 안정된 상수로 둔다. 공유 기본값을 변경하지 않는다.
- `rerender-dependencies`: effect가 실제 사용하는 값에 의존하게 구조를 좁힌다. 객체 전체 대신 사용하는 필드가 적절할 수 있지만 반응해야 할 의존성을 삭제해 실행을 억제하지 않는다.
- `rerender-derived-state`: 연속 값 전체보다 UI가 필요한 파생 값의 구독을 검토한다. 예를 들어 구간 진입 여부만 필요하면 모든 좌표 변화가 렌더를 유발하지 않게 한다.
- `rerender-derived-state-no-effect`: props/state에서 계산 가능한 값은 렌더 중 파생한다. state와 effect로 동일한 값을 복제·동기화하지 않는다.
- `rerender-functional-setstate`: 다음 값이 이전 state에 의존하면 함수형 갱신을 사용한다. updater는 순수하게 유지하고 이벤트·네트워크 부작용을 넣지 않는다.
- `rerender-lazy-state-init`: 비싼 초기 계산은 순수한 lazy initializer로 미룬다. 개발 중 반복 호출되어도 안전해야 하며 SSR의 첫 렌더와 브라우저 API 접근 조건을 보존한다.
- `rerender-simple-expression-in-memo`: 간단한 원시값 계산은 그대로 계산한다. 의존성 비교·Hook 관리 비용을 감수할 이유가 없으면 `useMemo`로 감싸지 않는다.
- `rerender-split-combined-hooks`: 의존성과 목적이 다른 계산·외부 동기화는 분리한다. Hook 호출 순서는 모든 렌더에서 유지한다.
- `rerender-move-effect-to-event`: 클릭·제출 같은 특정 행동이 원인인 작업은 해당 이벤트 처리에 둔다. effect는 외부 시스템과의 동기화에 사용한다.
- `rerender-transitions`: 긴급하지 않은 UI 갱신에는 transition을 검토한다. 입력 자체의 즉각적인 상태 갱신을 지연시키지 않는다.
- `rerender-use-deferred-value`: 입력은 즉시 반영하고 비싼 파생 화면에는 deferred value를 검토한다. 무거운 계산·렌더 경계를 분리해 이전 값으로도 같은 작업을 매번 반복하지 않게 한다.
- `rerender-use-ref-transient-values`: 렌더 결과를 바꿀 필요가 없는 타이머·이벤트의 임시 값은 ref에 둔다. 화면에 반영할 상태를 ref로 숨기거나 렌더 중 가변 ref를 읽고 쓰는 우회로 사용하지 않는다.
- `rerender-no-inline-components`: 렌더 안에서 새 함수를 정의해 컴포넌트 타입으로 사용하지 않는다. 외부에 정의된 컴포넌트 A/B를 조건에 따라 선택하는 것은 새 타입을 만드는 것과 다르다. 타입이 실제로 바뀌면 그 경계의 state는 재설정될 수 있다.

effect는 설정 때 확보한 구독 대상·DOM 요소로 정리한다. `ref.current`가 바뀌어도 `[ref]`가 그 변경을 구독하지는 않는다. 대상 교체를 지원해야 한다면 대상 변경이 effect에 전달되는 구조를 사용한다. Strict Mode에서도 setup → cleanup → setup이 안전해야 한다.

## 6. 브라우저 렌더링과 hydration

- `rendering-animate-svg-wrapper`: SVG 모션의 병목이 확인되면 wrapper의 transform·opacity 애니메이션을 검토한다. DOM 의미·포커스·모션 감소 설정을 유지하고 GPU 가속을 모든 브라우저에서 보장한다고 표현하지 않는다.
- `rendering-content-visibility`: 긴 화면의 화면 밖 콘텐츠에는 `content-visibility`를 검토한다. 검색·접근성·스크롤 높이·레이아웃 이동을 실제 브라우저에서 확인한다.
- `rendering-hoist-jsx`: props·state·context에 의존하지 않는 큰 정적 JSX만 외부 정의를 검토한다. Compiler가 처리하는 범위와 가독성을 함께 고려한다.
- `rendering-svg-precision`: SVG 좌표 정밀도는 실제 표시 크기에서 형태가 보존되는 범위에서만 줄인다. 디자인 자산의 승인된 표현을 임의로 바꾸지 않는다.
- `rendering-hydration-no-flicker`: 서버 HTML과 첫 클라이언트 렌더를 일치시키고 테마·사용자 설정의 초기 전달 경로를 설계한다. hydration 전 스크립트가 필요하면 CSP·직렬화·실행 순서·React 소유 DOM과의 충돌을 검증한다.
- `rendering-hydration-suppress-warning`: 불가피한 한정된 차이만 `suppressHydrationWarning`의 대상으로 삼는다. 경고 억제로 hydration 오류를 해결했다고 보고하거나 랜덤 ID·시간 차이를 기본적으로 허용하지 않는다.
- `rendering-activity`: 자주 숨겼다 보이는 무거운 UI의 state 보존이 필요할 때 지원 버전의 `Activity`를 검토한다. 숨겨진 동안의 effect 정리·재개, 포커스와 접근성을 확인한다.
- `rendering-conditional-render`: 숫자 등이 조건이면 `0`·`NaN`이 텍스트로 출력되지 않도록 명시적으로 비교하거나 삼항식을 사용한다. boolean 조건의 `&&`까지 일괄 금지하지 않는다.
- `rendering-usetransition-loading`: transition의 진행 상태를 표시할 때 `isPending`을 사용한다. 모든 비동기 loading·오류·취소·요청 순서 관리를 대체하는 API로 사용하지 않는다.
- `rendering-resource-hints`: 실제로 곧 필요한 리소스에 preload·preconnect 등의 hint를 검토한다. 이미 프레임워크가 처리하는 리소스와 중복하거나 중요한 리소스의 대역폭을 빼앗지 않게 한다.
- `rendering-script-defer-async`: Next.js는 `next/script`의 적절한 strategy를 우선 검토한다. 일반 script의 defer는 실행 순서를 보존하고 async는 보장하지 않으므로 의존 관계에 맞게 선택한다.

transition과 deferred value는 네트워크 요청을 자동 취소하거나 debounce하지 않는다. 오래된 응답이 최신 상태를 덮지 않도록 별도의 요청 수명·오류 처리를 유지한다.

## 7. JavaScript의 반복 비용

- `js-batch-dom-css`: 레이아웃 읽기와 스타일 쓰기를 번갈아 수행하지 않는다. 필요한 읽기를 모으고 기존 토큰·클래스로 쓰기를 구성한다.
- `js-index-maps`: 같은 키로 반복 탐색하는 큰 컬렉션은 인덱스 Map을 검토한다. 인덱스 생성 비용과 원본 변경 시 갱신 책임을 포함한다.
- `js-cache-property-access`: 자주 실행되는 반복문에서 같은 깊은 속성 조회를 반복하면 지역 값으로 재사용한다. getter·가변 값의 의미를 바꾸지 않는다.
- `js-cache-function-results`: 반복 계산의 캐시는 입력의 완전한 키, 크기 제한, 무효화와 실행 환경을 정한 경우에만 사용한다. 요청별 데이터를 전역 Map에 무분별하게 쌓지 않는다.
- `js-cache-storage`: 반복되는 동기 storage·cookie 접근은 필요하면 캐시한다. 다른 탭·직접 쓰기·로그인 전환 등 원본 변경 시 갱신하며 사용자 간 값을 공유하지 않는다.
- `js-combine-iterations`: 큰 데이터의 반복 순회가 병목이면 여러 filter/map의 결합을 검토한다. 읽기 쉬운 코드를 무조건 수동 반복문으로 치환하지 않는다.
- `js-length-check-first`: 길이가 다르면 같을 수 없는 비교에서 길이를 먼저 확인해 비싼 정렬·깊은 비교를 생략한다.
- `js-early-exit`: 결과가 확정되면 조기에 반환한다. 필요한 검증과 자원 정리를 건너뛰지 않는다.
- `js-hoist-regexp`: 반복 생성되는 정규식은 입력이 고정되어 있을 때 재사용한다. `g`·`y` 플래그의 가변 `lastIndex`가 호출 간 섞이지 않게 한다.
- `js-min-max-loop`: 최솟값·최댓값만 필요하면 전체 정렬 대신 한 번의 순회를 사용한다. 빈 배열의 결과와 비교 기준도 명시한다.
- `js-set-map-lookups`: 반복 membership 조회에는 Set/Map을 검토한다. 한 번의 작은 조회마다 새 Set을 만드는 것이 유리하다고 가정하지 않는다.
- `js-tosorted-immutable`: props/state의 배열은 직접 정렬·변경하지 않는다. 지원 환경에서는 `toSorted` 등 불변 메서드를, 아니면 복사 후 연산을 사용한다.
- `js-flatmap-filter`: 변환하면서 일부 항목을 제외할 때 `flatMap`으로 중간 배열을 줄일 수 있다. 자동으로 더 빠르다고 단정하지 않고 값 보존과 가독성을 확인한다.
- `js-request-idle-callback`: 즉시 완료할 필요 없는 클라이언트 작업만 idle 시점으로 미룬다. 지원 여부·fallback·timeout·취소를 처리하고 사용자 피드백이나 필수 저장을 무기한 지연시키지 않는다.

## 8. 고급 패턴의 적용 조건

- `advanced-effect-event-deps`: `useEffectEvent`의 반환 함수를 effect 의존성에 넣지 않는다. 실제 반응형 값은 의존성에 유지하고 Effect Event는 해당 effect 또는 그 effect에서 만든 구독의 처리에 사용한다.
- `advanced-event-handler-refs`: callback 변경만으로 구독을 다시 만들 필요가 없는 경우 최신 값 접근과 구독 수명을 분리한다. 지원되는 `useEffectEvent` 또는 생명주기가 검증된 ref 기반 도구를 사용하고 렌더 중 ref 갱신으로 대체하지 않는다.
- `advanced-init-once`: 앱당 한 번인 초기화와 컴포넌트가 나타날 때마다 필요한 effect를 구분한다. 브라우저 앱 범위 초기화는 재실행에 안전하게 설계하고 서버 요청 상태를 모듈 전역 초기화에 섞지 않는다. 전역 flag로 필요한 cleanup·재구독을 막지 않는다.
- `advanced-use-latest`: effect에서 발생한 이벤트가 최신 props/state를 읽어야 하되 해당 값 때문에 재구독할 필요가 없는 경우에만 적용한다. 의존성 검사를 피하거나 JSX 이벤트 핸들러·다른 컴포넌트에 Effect Event를 전달하는 수단으로 사용하지 않는다.

원문의 `advanced-event-handler-refs` 설명에는 Effect Event가 안정된 함수 참조를 제공한다는 표현이 있지만, [React 공식 useEffectEvent 계약](https://react.dev/reference/react/useEffectEvent)은 함수 동일성을 보장하지 않는다. 이 프로젝트는 함수 참조의 안정성에 의존하지 않고, effect 안에서 최신 커밋 값을 읽는 API로만 사용한다. [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)와 [React의 컴포넌트·Hook 호출 규칙](https://react.dev/reference/rules/react-calls-components-and-hooks)을 함께 따른다.

## 작업 절차와 검증

1. 변경할 동작과 관련 규칙을 선택하고 기존 코드·공개 API·데이터 의존성·실행 환경을 확인한다. 적용 조건이 맞지 않는 규칙을 억지로 도입하지 않는다.
2. 동작을 보존하는 범위에서 구현한다. 필요하면 해당 규칙의 원문 예시와 설치 버전의 React·Next.js 공식 문서를 대조한다. 원문 예시와 프로젝트 적용 방식이 다르면 그 이유를 남긴다.
3. 영향받은 lint·타입·포맷·동작 검사를 실행한다. 테스트는 현재 저장소의 지침과 runner를 따른다. 명령과 검사 범위는 현재 패키지 스크립트에서 확인한다.
4. 성능 개선을 주장하려면 비교 가능한 조건의 네트워크 시작 시점·번들 분석·React Profiler·브라우저 성능 기록 등 관련 근거를 확인한다. 원문의 배수·밀리초 수치를 이 프로젝트의 측정 결과처럼 보고하지 않는다.
5. 캐시는 사용자·요청 격리와 무효화를, effect는 해제·재설정을, SSR 변경은 실제 hydration을, 모션·포커스 변경은 실제 브라우저 동작을 확인한다. 실행하지 못한 항목은 미검증으로 남긴다.

지침 추가만으로 제품 코드·의존성·lint 설정을 일괄 바꾸지 않는다. 생성 정합성, 도구의 지침 발견, 실제 모델 준수, 제품 동작·성능 검증은 서로 구분한다.
