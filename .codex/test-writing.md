<!-- AUTO-GENERATED from .agent-source/conventions/test-writing/source.md by scripts/sync-instructions.mjs. Do not edit; run node scripts/sync-instructions.mjs --write. -->

# 테스트 작성 계약

## 목적과 적용 범위

테스트 하나만 읽어도 준비 조건·행동·기대 결과를 이해하고, 단독 실행과 실행 순서 변경에 관계없이 같은 공개 동작을 검증할 수 있어야 한다. 테스트 작성·수정·리뷰와 fixture·helper·테스트 환경 변경에 적용한다.

## 검증 범위와 도구 역할

- 제품 코드의 단위·컴포넌트 테스트는 Vitest로 작성한다. 함수·Hook·컴포넌트의 공개 동작과 컴포넌트 내부의 조합을 검증하며, props·상태·콜백·렌더링·ARIA 연결 등이 대상이다. 컴포넌트와 Hook이 함께 작동하는 검증도 이 범위에 포함한다.
- 이 프로젝트에서 통합 테스트는 **앱 단위 통합 테스트**를 뜻하며 Playwright E2E로 작성한다. 실제 앱 서버를 실행하고 브라우저에서 앱 경로에 접속해 페이지 이동·여러 기능의 연결·서버 연동을 포함한 사용자 흐름을 검증한다. 컴포넌트만 별도로 mount한 검증을 앱 통합 테스트로 보고하지 않는다.
- 테스트를 작성하기 전에 컴포넌트 범위인지 앱 범위인지 정하고 해당 runner를 선택한다. Vitest는 앱 E2E를, Playwright E2E는 컴포넌트 내부의 모든 조건·조합 검사를 대신하지 않는다. 세부 조건은 Vitest에 두고 앱에서 이어지는 핵심 흐름은 E2E에 둔다.
- 실제 레이아웃·스크롤·네이티브 Tab 이동·포커스 순환·배경 잠금처럼 브라우저가 보장하는 동작은 앱 단위 Playwright E2E에서 확인한다. DOM 모사 환경의 결과만으로 실제 브라우저 동작을 검증했다고 보고하지 않는다.
- SSR·hydration 검사는 브라우저 전역 접근·portal·ID 연결 등 변경의 위험에 맞춰 추가한다. 모든 컴포넌트에 브라우저·SSR 테스트를 한 쌍으로 만들도록 요구하지 않는다. `.browser`·`.ssr` 같은 접미사는 실행 환경을 구분하는 현재 설정이며 앱 통합 테스트 여부를 결정하지 않는다.
- 기존 `scripts/*.test.mjs`·lint 설정의 `node:test`는 개발 도구 검증으로 유지한다. 제품 테스트의 도구 역할을 정했다는 이유로 이 테스트를 일괄 전환하지 않는다.

## 파일 위치와 이름

- 테스트 소스는 검증 대상 파일과 같은 디렉터리에 둔다. `e2e/`, `tests/`, `__tests__/` 같은 별도 테스트 디렉터리를 만들거나 앱의 테스트를 한곳에 모으지 않는다.
- Playwright E2E는 `<대상 파일명>.e2e.spec.ts`로 작성한다. 예를 들어 `apps/web/app/page.tsx`의 앱 진입 흐름은 바로 옆 `apps/web/app/page.e2e.spec.ts`에 둔다. 여러 페이지를 거치는 흐름은 주된 대상 페이지·기능 파일 옆에 두고 같은 시나리오를 경로마다 복제하지 않는다.
- 같은 디렉터리에 놓는 것은 파일 배치 규칙이다. E2E는 계속 실제 앱 서버와 `page.goto()`를 사용하며 대상 컴포넌트를 직접 import·mount하는 테스트로 바꾸지 않는다. 테스트 파일을 제품의 공개 API에서 export하거나 런타임 코드에서 import하지 않는다.
- Playwright는 앱 소스 범위에서 `**/*.e2e.spec.ts`만 수집한다. Vitest의 수집 패턴과 구분하고 빌드·보고서·의존성 디렉터리는 수집 대상에서 제외한다.
- 테스트 전용 helper·fixture는 사용하는 테스트 옆에 둔다. 공통 runner setup은 `vitest.setup.ts`처럼 해당 설정 파일 옆에 둔다. 자동 생성되는 `test-results/`·`playwright-report/`는 테스트 소스가 아니며 Git에서 제외한다.
- 포스트 E2E는 실제 `apps/web/docs/posts`를 읽는다. `docs`나 `app`에 데모·테스트용 콘텐츠 트리를 만들지 않는다. 실제 원고와 자산은 읽기만 하며, 테스트를 위해 초안을 공개 버전으로 바꾸거나 발행본을 추가하지 않는다. 로더·변환기의 단위 테스트에 필요한 최소 입력은 테스트가 소유한 임시 경로에서 만들고 정리한다.

## 독립성과 가독성

- 최상위 `test`·`it`을 기본으로 한다. 논리적으로 다른 대상은 파일 분리를 우선하되, 의미 있는 `describe`와 서버 수명주기·전역 복원 hook을 일괄 금지하지 않는다.
- 입력, mock, DOM, 임시 파일, actor와 가변 context는 테스트별로 생성한다. 중첩된 `beforeEach`와 외부 `let`에 의존해 시나리오를 조립하지 않는다.
- 순수 정의·읽기 전용 상수는 공유할 수 있다. 같은 행동·검증에서 데이터만 다르면 표 기반 테스트를 사용한다. 단순 중복 제거를 위해 준비 조건을 hook에 숨기지 않는다.
- helper는 테스트가 직접 호출하고 입력·반환값·자원 소유권을 드러낸다. 공유 가변 상태에 의존하지 않으며, 반복이 유지보수 문제일 때만 추출한다. 이해하기 쉬운 중복은 허용한다.

## 자원 소유권과 실패 시 정리

- 자원을 얻은 직후, 후속 `start`·`render`·`await`·assertion 전에 정리를 등록하거나 `try/finally` 범위를 연다. 성공 경로 끝의 `stop`·`unmount`·`close`만으로는 충분하지 않다.
- 구독 해제, actor·DOM 정리, fake timer·spy·전역 복원 순서를 보장한다. actor의 `stop`을 별도 구독의 `unsubscribe`로 간주하지 않는다.
- 여러 정리 콜백 또는 중첩 `try/finally`로 한 정리의 실패가 나머지 복원을 막지 않게 한다. 테스트 도구의 자동 정리 범위와 hook 실행 순서는 설치된 구현·설정에서 확인한다.
- 임시 디렉터리는 생성한 테스트가 소유하며 복사·파일 쓰기 전에 삭제를 예약한다. 실제 프로젝트·사용자 파일을 fixture로 덮어쓰지 않는다. 브라우저 컨텍스트와 서버도 자동 fixture 또는 실패 시 실행되는 정리를 사용한다.
- DOM·fake timer·전역 spy를 공유하는 테스트는 동시에 실행하지 않는다. 병렬 테스트는 테스트 컨텍스트에 결합된 정리와 독립된 자원을 사용한다.

## 시간과 React 검증

- 현재 시각·시간대·예약 작업에 의존하면 테스트 본문에 clock의 기준을 명시한다. 고정 sleep으로 내부 작업을 기다리지 않고 fake timer·주입한 clock이나 공개 조건을 기다리는 API를 사용한다. 취소·unmount 뒤 남은 예약 작업도 확인한다.
- DOM 갱신은 `act`로 완료한다. 공개 hook API를 관찰하는 Probe는 commit effect에서 결과를 기록한다. 렌더 중 외부 배열·ref에 노출한 값은 commit 증거가 아니다.
- 테스트 콜백에서 한 번 정의한 지역 Probe는 허용한다. 렌더 중 컴포넌트 타입을 다시 만들거나 rerender마다 fixture를 재생성하지 않는다. StrictMode의 렌더 횟수를 계약으로 고정하지 않는다.
- 컴포넌트의 SSR 가능 여부를 검사할 때는 `window`·`document`가 없는 Vitest Node 환경을 사용한다. 컴포넌트 hydration을 직접 검사할 때는 기존 서버 노드의 참조 동일성과 오류 부재를 함께 확인한다. ID·ARIA 연결이 있으면 그 값과 인스턴스별 유일성도 검증한다. 실제 앱의 초기 로딩·hydration 이후 사용자 흐름은 Playwright E2E에서 확인한다.
- jsdom으로 네이티브 키보드·포커스 이동·브라우저 레이아웃을 증명하지 않는다. 필요한 앱 E2E를 실행할 환경이 없으면 해당 동작은 미검증으로 남긴다.
- 경고를 숨기는 mock은 예상 호출·미호출을 검사한다. 내부 구현 복제, 의미 없는 snapshot, 근거 없는 렌더 횟수로 공개 동작 검증을 대체하지 않는다.

## 현재 저장소의 실행 범위

- 실행 명령과 의존성은 대상 `package.json`·테스트 파일·설정을 먼저 확인한다. 루트 `package.json`에는 `test` 스크립트가 없다. `pnpm test`나 루트 품질 검사만으로 전체 테스트가 실행됐다고 보고하지 않는다.
- 현재 `scripts/*.test.mjs`와 `packages/lint-config`는 Node.js 내장 `node:test`를 사용한다. 생성기 변경은 `node --test scripts/sync-instructions.test.mjs`, 품질 도구 적용 범위 변경은 `node --test scripts/code-quality.test.mjs`, lint 플러그인·프리셋 변경은 `pnpm --filter @repo/lint-config test`로 검증한다. 단독 실행에는 해당 테스트 파일을 지정한다.
- `apps/web`은 현재 `pnpm --filter web test`로 Vitest를 실행한다. `vitest.config.ts`의 Node 프로젝트는 `shared/**/*.ssr.test.tsx`와 `entities/**/*.test.ts`·`scripts/**/*.test.ts`의 글 로더·MDX 변환을, 기존 Browser Mode 프로젝트는 `shared/**/*.browser.test.tsx`를 모바일 Light·데스크톱 Dark의 Chromium에서 검사한다. 여기서 Playwright는 Vitest의 브라우저 실행 provider이며 앱 통합 테스트 runner가 아니다. 이 기존 구성의 최초 실행에는 `pnpm --filter web exec playwright install chromium --only-shell`이 필요하다.
- `apps/web`의 앱 통합 테스트는 `pnpm --filter web test:e2e`로 실행한다. `playwright.config.ts`는 앱 루트부터 대상 파일 옆의 `**/*.e2e.spec.ts`를 수집하며 `.gitignore`의 제외 경로를 따른다. `webServer`로 프로덕션 빌드·서버를 실행해 `http://127.0.0.1:3100`에서 Chromium 데스크톱 Dark·모바일 Light를 검사한다. 최초 실행에는 `pnpm --filter web exec playwright install chromium`, Linux CI에서는 `install --with-deps chromium`으로 브라우저 실행 환경을 준비한다. 3100 포트의 기존 서버를 재사용하지 않으며 서버와 테스트별 page·컨텍스트는 Playwright가 정리한다.
- 현재 앱 E2E는 빈 홈의 문서·리소스 로딩·404 응답과 실제 `docs/posts` 기준 목록·사이트맵·공개 상세 주소·초안 비공개를 검사한다. `BLOG_NEXT_DIST_DIR`로 빌드 경로만 분리한다. 공개 원고가 없거나 과거 발행본이 없는 경우, 본문·버전 전환 검증까지 통과했다고 보고하지 않는다. Header·Sidebar는 아직 앱 경로에 연결되어 있지 않으므로 관련 사용자 흐름까지 검증됐다고 보고하지 않는다. 기존 Vitest Browser Mode나 Storybook의 컴포넌트 검사를 앱 E2E로 대체하지 않는다. `apps/docs`·`packages/ui`에는 별도 테스트 runner가 없으며 앱의 컴포넌트 테스트를 공유 UI 전체 검증으로 보고하지 않는다.
- 초안 미리보기 E2E는 `pnpm --filter web test:e2e:preview`로 실행한다. `playwright.preview.config.ts`가 `**/*.preview.e2e.spec.ts`만 수집하고, 일반 개발 명령인 `dev --port 3102`로 실제 초안을 읽는 서버를 실행한다. 공개 E2E에서는 이 파일을 제외한다. 미리보기 E2E는 실제 초안의 본문·이미지 로딩·모바일 넘침·검색 제외를 검사하며, 공개 본문이나 과거 버전 전환 검증을 대신하지 않는다. 생성 모듈은 `screens/posts/generated-preview/`, 개발 빌드는 `.next-preview/`를 사용해 공개 생성물과 분리한다. 테스트 중 실제 원고와 이미지를 수정하지 않는다.
- 기존 앱 Browser Mode 테스트는 `vitest-browser-react/pure`의 `render`와 StrictMode를 사용한다. `vitest.config.ts` 옆 `vitest.setup.ts`의 `afterEach`가 DOM·portal·effect를 정리하고, 그 뒤 테스트별 `onTestFinished`가 직접 획득한 자원과 전역을 복원한다. 수동 hydration root는 테스트가 직접 해제하며 React `act` 환경도 복원한다. 테스트별 가변 fixture를 공용 setup에 숨기지 않는다.
- `node:test`의 정리는 테스트 컨텍스트의 `t.after`·`t.mock` 또는 `try/finally`를 사용한다. Vitest의 `onTestFinished`·`vi`와 혼용하지 않는다. Vitest Node 프로젝트는 Vitest의 API를 사용하며, 실행 환경이 Node라는 이유로 `node:test`와 혼동하지 않는다. runner를 바꾸면 자동 cleanup·hook 순서를 다시 확인한다.

## 준비와 정리 예시

다음은 Node 테스트용 fixture helper다. `template`은 호출한 테스트가 명시하는 읽기 전용 fixture 경로이며, 반환된 작업 공간에만 변경을 수행한다. `fs`, `os`, `path`는 각각 Node 내장 모듈이다.

```js
// Incorrect: 복사 중 실패하면 정리가 등록되지 않는다.
function createWorkspace(t, template) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'instruction-test-'));
  fs.cpSync(template, root, { recursive: true });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}
```

```js
// Correct: 자원 획득 직후, 복사 전에 해당 테스트의 정리를 등록한다.
function createWorkspace(t, template) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'instruction-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.cpSync(template, root, { recursive: true });
  return root;
}
```

수동 브라우저 컨텍스트도 `const context = await browser.newContext()` 직후 `try/finally`를 열고 `newPage`·탐색·assertion을 그 안에서 실행한 뒤 `finally`에서 닫는다. runner가 제공하는 fixture와 직접 만든 자원의 정리를 구분한다.

## 검증과 비목표

- 영향받은 동작의 테스트와 해당 범위의 타입·lint·포맷 검사를 실행한다. 테스트 실행·타입 검사·지침 정합성을 서로 대체하지 않는다. 명령이 검사하지 않은 파일·패키지까지 통과했다고 보고하지 않는다.
- 공유 환경·정리 방식을 바꿨다면 단독 실행 또는 runner가 지원하는 순서 변경으로 격리를 확인한다. 무작위 순서를 쓸 때는 재현 가능한 seed를 기록한다. 실패·추가 변경·미해결 우려가 없으면 같은 검사를 반복하거나 범위를 계속 넓히지 않는다.
- 지침 추가만을 이유로 무관한 테스트를 일괄 재작성하거나 테스트 도구·lint 규칙을 교체하지 않는다. 되돌리기 쉬운 단순 스타일 변경이나 구현을 그대로 복제하는 테스트는 늘리지 않는다.
- Iris 코어 `packages/ui/src/base/**`의 스타일·구조 컨벤션과 포맷 예외를 유지한다. 자원 누수와 잘못된 assertion은 동작 문제로 구분하고 correctness·타입·접근성 검증은 유지한다.
- 적용한 계약, 실제 검사한 범위와 결과, 예외·실패·미검증 항목을 보고한다. 이 문서는 작성·리뷰 지침이며 자동 lint 규칙이 아니다.

## Codex 실행 방식

1. 루트 `AGENTS.md`가 테스트 작업 전에 이 문서를 읽도록 연결한다. `.codex/test-writing.md`라는 파일명 자체의 자동 로딩에 의존하지 않는다.
2. 먼저 요청을 Vitest의 함수·Hook·컴포넌트 검증과 Playwright E2E의 앱 단위 통합 검증으로 분류한다. 셸 도구로 변경 동작, 기존 테스트·helper의 실제 구현, 대상 패키지의 runner·스크립트·정리 설정을 확인하고 해당 범위에 필요한 계약을 적용한다.
3. 테스트 본문에서 조건·행동·결과를 드러내고 실패 시 정리를 보장한다. diff를 공통 계약과 위 예시에 대조한 뒤 영향받은 검사부터 실행한다. 셸 명령은 현재 환경의 실행 규칙을 따른다.
4. 쓰기나 실행이 샌드박스에 막히면 현재 실행 도구의 승인 절차를 따른다. 결과에는 실제 실행한 검사와 정적 확인·미검증 범위를 구분한다. 지침 생성이나 스킬 발견을 테스트 통과로 보고하지 않는다.
