# Header

구현과 공개 API는 `shared/ui`에 있습니다. `widgets/blog-frame` 진입점은 기존 사용처를 위해 같은 API를 재수출합니다.

헤더는 `leftChildren`, `rightChildren`, `title`과 기본 HTML header 속성을 받습니다. 하나의 `<header>`를 렌더링하고, 기존 Tailwind 클래스와 `mobile:` / `desktop:` 구간으로 반응형을 처리합니다. 높이는 64px이므로 본문 상단 여백은 사용하는 레이아웃에서 확보합니다.

인터랙션을 담당하는 React 컴포넌트 하나를 `plugin`으로 전달합니다. 기본값은 `null`이며, 생략하면 공통 헤더만 렌더링합니다.

```tsx
'use client';

import { Header, ScrollHeaderPlugin } from './shared/ui';

export function BlogHeader() {
  return (
    <Header
      title="블로그"
      leftChildren={<a href="/">홈</a>}
      rightChildren={<button type="button">메뉴</button>}
      plugin={ScrollHeaderPlugin}
    />
  );
}
```

위 import 경로는 앱 루트 기준 예시이며 사용 위치에 맞춰 조정합니다. Next.js에서는 컴포넌트 타입인 plugin을 클라이언트 컴포넌트에서 연결합니다. 제목과 링크는 서버가 렌더링하는 초기 HTML에도 포함되며, 화면 크기에 따라 별도의 헤더 트리를 만들지 않습니다.

| 선택                   | 동작                                                                         |
| ---------------------- | ---------------------------------------------------------------------------- |
| 생략 또는 `null`       | 공통 헤더만 렌더링하며 플러그인을 마운트하지 않음                            |
| `ScrollHeaderPlugin`   | 스크롤 방향별 숨김·노출, 스크롤 후 경계선과 배경, 포커스·페이지 복원 시 노출 |
| 사용자 plugin 컴포넌트 | 자신의 Hook으로 효과와 상태를 관리                                           |

## Plugin 계약

```ts
import type { ComponentType, RefObject } from 'react';

type HeaderPluginProps = {
  headerRef: RefObject<HTMLElement | null>;
};

type HeaderPlugin = ComponentType<HeaderPluginProps>;
```

`Header`는 `<Plugin headerRef={headerRef} />`를 렌더링합니다. 플러그인을 일반 함수로 직접 실행하지 않습니다. 플러그인에서는 정적으로 선언한 `useEffect`, `useState`, 커스텀 Hook 등을 최상위에서 호출할 수 있습니다. 동작만 추가하는 플러그인은 `null`을 반환합니다. Hook 자체를 prop으로 전달하는 `plugin={useSomePlugin}` 방식은 지원하지 않습니다. [React의 컴포넌트와 Hook 호출 규칙](https://react.dev/reference/rules/react-calls-components-and-hooks)

```tsx
<Header plugin={enabled ? ScrollHeaderPlugin : null} />
```

`null`에서 컴포넌트로 바꾸면 마운트하고, 다시 `null`로 바꾸면 언마운트하며 effect를 정리합니다. 같은 위치에서 다른 컴포넌트 타입으로 바꾸면 이전 플러그인을 제거하고 새 플러그인을 마운트합니다. 플러그인의 로컬 상태는 초기화되지만 헤더 DOM과 슬롯 콘텐츠는 유지됩니다. `Host`, plugin을 복사한 state, 교체를 추적하는 key는 필요하지 않습니다. [React의 상태 보존과 초기화](https://react.dev/learn/preserving-and-resetting-state)

- 플러그인 컴포넌트는 모듈 범위에 선언합니다. `plugin={() => ...}`처럼 렌더마다 새 컴포넌트 타입을 만들면 상태가 초기화되고 구독이 반복됩니다. [React static-components](https://react.dev/reference/eslint-plugin-react-hooks/lints/static-components)
- `headerRef.current`는 effect 안에서 읽습니다. 최초 렌더에서는 아직 DOM이 연결되지 않았을 수 있습니다. 이 헤더는 마운트된 동안 같은 `<header>` 요소와 ref를 유지합니다.
- 이벤트·타이머·observer를 만들면 effect에서 cleanup을 반환합니다. 자신이 변경한 속성과 inline style도 원래 값으로 복원합니다. cleanup에서는 effect가 시작할 때 읽은 요소를 사용합니다.
- 스크롤 플러그인은 `data-scrolled`, `data-border-visible`, `style.transform`을 관리합니다. 같은 속성을 다른 효과나 부모에서 동시에 변경하지 않습니다.
- Strict Mode의 추가 설정·정리에도 구독이 중복되지 않아야 합니다. [React useEffect](https://react.dev/reference/react/useEffect#reference)
- 현재 `Header`가 전달하는 공통 prop은 `headerRef` 하나입니다. 추가 고정 옵션이 필요하면 모듈 범위의 플러그인 컴포넌트에서 구체적인 동작을 구성합니다. 범용 옵션 전달 API나 Context는 도입하지 않았습니다.

예를 들어 경계선을 숨기는 플러그인은 다음처럼 만듭니다.

```tsx
'use client';

import { useEffect } from 'react';
import type { HeaderPluginProps } from './shared/ui';

export function BorderlessHeaderPlugin({ headerRef }: HeaderPluginProps) {
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const previous = header.getAttribute('data-border-visible');
    header.dataset.borderVisible = 'false';

    return () => {
      if (previous === null) header.removeAttribute('data-border-visible');
      else header.setAttribute('data-border-visible', previous);
    };
  }, [headerRef]);

  return null;
}
```

호출부에서는 `<Header plugin={BorderlessHeaderPlugin} />`으로 연결합니다. 이 예시는 새로운 시각 값 대신 기존 상태 스타일을 사용합니다. 서버 HTML은 effect가 실행되기 전의 공통 기본 모습으로 표시됩니다.

`ScrollHeaderPlugin`도 같은 구조입니다. 내부의 `scrollHeaderPlugin(header)` 함수가 기존 DOM 로직을 설치하고 cleanup을 반환하며, 컴포넌트의 `useEffect`가 그 수명을 관리합니다. 이 설치 함수는 내부 구현이고, 위젯의 공개 API에서는 `ScrollHeaderPlugin` 컴포넌트를 사용합니다.

단일 플러그인이라고 모든 부수 효과의 충돌이 사라지는 것은 아닙니다. 여러 동작을 함께 구성할 때는 상태의 소유권과 우선순위를 정해야 합니다. 현재 스크롤 플러그인은 키보드 포커스가 헤더 안에 있을 때 노출을 우선합니다.
