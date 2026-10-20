import { describe, it } from 'node:test';
import { RuleTester } from 'oxlint/plugins-dev';
import singleEffect from './single-effect.ts';

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
  // RuleTester의 기본 cwd는 Oxlint 설치 위치이므로 프로젝트 소스 경로를 명시합니다.
  cwd: '/plugin-project',
  languageOptions: { parserOptions: { lang: 'tsx' } },
});
const setup = '() => install()';
const component = (body: string, imports = "import { useEffect } from 'react';") =>
  `${imports}\nexport function ScrollHeaderPlugin() { ${body}\nreturn null; }`;

tester.run('single-effect', singleEffect, {
  valid: [
    {
      name: 'node_modules의 외부 Plugin 구현은 파일이 전달되어도 검사하지 않음',
      filename: '/workspace/node_modules/external-package/plugin.tsx',
      code: 'export function ExternalPlugin() { return null; }',
    },
    {
      name: '현재 헤더처럼 ref 가드 이후 설치 함수의 cleanup을 반환',
      code: `
        import { useEffect } from 'react';
        export function ScrollHeaderPlugin({ headerRef }: HeaderPluginProps) {
          useEffect(() => {
            const header = headerRef.current;
            if (!header) return;
            return scrollHeaderPlugin(header);
          }, [headerRef]);
          return null;
        }
      `,
    },
    { name: '직접 cleanup 반환', code: component('useEffect(() => { start(); return () => stop(); }, []);') },
    {
      name: '설치·계산·정리 일반 함수를 자유롭게 조합',
      code: component(`useEffect(() => {
        const state = calculateState();
        const stopScroll = installScroll(state);
        const stopFocus = installFocus(state);
        return () => { stopFocus(); stopScroll(); };
      }, []);`),
    },
    {
      name: 'effect 밖에서 계산·React 상태 Hook 허용',
      code: component(
        `const state = useRef(0); calculate(state); useEffect(${setup}, []);`,
        "import { useEffect, useRef } from 'react';",
      ),
    },
    {
      name: 'React named import 별칭',
      code: component(`effect(${setup}, []);`, "import { useEffect as effect } from 'react';"),
    },
    ...["import React from 'react';", "import * as React from 'react';"].map((imports) => ({
      name: imports,
      code: component(`React.useEffect(${setup}, []);`, imports),
    })),
    {
      name: '문자열 멤버 접근',
      code: component(`React['useEffect'](${setup}, []);`, "import * as React from 'react';"),
    },
    {
      name: 'const 별칭과 React 구조 분해',
      code: component(
        `effect(${setup}, []);`,
        "import * as React from 'react'; const { useEffect: initial } = React; const effect = initial;",
      ),
    },
    {
      name: '화살표 컴포넌트와 타입 단언',
      code: `import { useEffect } from 'react';
        export const ScrollHeaderPlugin = (() => { useEffect(${setup}, []); return null; }) satisfies HeaderPlugin;`,
    },
    {
      name: 'React memo·forwardRef 래퍼',
      code: `import { memo as cache, forwardRef, useEffect } from 'react';
        export const ScrollHeaderPlugin = cache(forwardRef(() => { useEffect(${setup}, []); return null; }));`,
    },
    {
      name: '한 파일의 Plugin들은 각각 effect 하나',
      code: `import { useEffect } from 'react';
        export function ScrollHeaderPlugin() { useEffect(${setup}, []); return null; }
        export const FocusHeaderPlugin = () => { useEffect(${setup}, []); return null; };`,
    },
    {
      name: '일반 컴포넌트·Hook에는 적용하지 않음',
      code: `import { useEffect } from 'react';
        export function Header() { useEffect(() => {}, []); useEffect(() => {}, []); return null; }
        export function useScroll() { useEffect(() => {}, []); }`,
    },
    {
      name: 'Plugin props를 받는 일반 함수는 컴포넌트가 아님',
      code: `export function calculate(props: HeaderPluginProps) { return props; }
        export const readHeader = (props: HeaderPluginProps) => props;`,
    },
    {
      name: 'Plugin suffix가 없는 이름과 소문자 설치 함수는 검사하지 않음',
      code: `export function PluginProvider() { return null; }
        export const PluginPanel = () => null;
        export function scrollHeaderPlugin() { return () => {}; }`,
    },
    {
      name: 'HeaderPlugin 타입만으로는 검사 대상을 늘리지 않음',
      code: 'export const Behavior: HeaderPlugin = () => null;',
    },
    {
      name: '외부에서 import·재수출·memo로 감싼 Plugin 구현은 검사하지 않음',
      code: `import { memo } from 'react';
        import { ExternalPlugin } from 'third-party';
        export { ExternalPlugin };
        export const WrappedPlugin = memo(ExternalPlugin);`,
    },
    {
      name: '다른 컴포넌트·중첩 함수의 effect를 부모에 합산하지 않음',
      code: component(`
        function Child() { useEffect(() => {}, []); return null; }
        function helper(effect) { effect(); }
        useEffect(${setup}, []);
      `),
    },
    {
      name: '뒤에서 선언된 로컬 setup 함수',
      code: component('useEffect(start, []); function start() { return install(); }'),
    },
    {
      name: '로컬 setup·cleanup const 별칭',
      code: component('const start = () => { const stop = install(); return stop; }; useEffect(start, []);'),
    },
    {
      name: '가드가 포함된 expression callback',
      code: component('useEffect(() => enabled ? install() : undefined, []);'),
    },
    {
      name: 'PluginProps 타입을 받더라도 suffix가 없으면 검사하지 않음',
      code: `import type { HeaderPluginProps as Props } from './types';
        export function Behavior(props: Props) { return null; }`,
    },
  ],
  invalid: [
    {
      name: '파일 이름에만 node_modules가 포함된 프로젝트 소스는 검사',
      filename: '/workspace/src/node_modules-helper.tsx',
      code: 'export function SidebarPlugin() { return null; }',
      errors: [{ messageId: 'effectCount' }],
    },
    {
      name: 'effect가 없음',
      code: component(''),
      errors: [{ messageId: 'effectCount', data: { name: 'ScrollHeaderPlugin', count: 0 } }],
    },
    {
      name: 'effect 두 개',
      code: component(`useEffect(${setup}, []); useEffect(${setup}, []);`),
      errors: [{ messageId: 'effectCount', data: { name: 'ScrollHeaderPlugin', count: 2 } }],
    },
    {
      name: '별칭과 namespace로 나눠도 합산',
      code: component(
        `effect(${setup}, []); React.useEffect(${setup}, []);`,
        "import React, { useEffect as effect } from 'react';",
      ),
      errors: [{ messageId: 'effectCount', data: { name: 'ScrollHeaderPlugin', count: 2 } }],
    },
    {
      name: 'const 별칭·구조 분해로 나눠도 합산',
      code: component(
        `effect(${setup}, []); initial(${setup}, []);`,
        "import React from 'react'; const { useEffect: initial } = React; const effect = initial;",
      ),
      errors: [{ messageId: 'effectCount', data: { name: 'ScrollHeaderPlugin', count: 2 } }],
    },
    ...['useLayoutEffect', 'useInsertionEffect', 'useSyncExternalStore'].map((hook) => ({
      name: `${hook}로 생명주기 추가 금지`,
      code: component(
        `useEffect(${setup}, []); extra(${setup}, []);`,
        `import { useEffect, ${hook} as extra } from 'react';`,
      ),
      errors: [{ messageId: 'otherEffect' }],
    })),
    {
      name: '대체 effect만 사용하는 경우도 실패',
      code: component(`useLayoutEffect(${setup}, []);`, "import { useLayoutEffect } from 'react';"),
      errors: [{ messageId: 'effectCount' }, { messageId: 'otherEffect' }],
    },
    {
      name: '로컬 커스텀 Hook으로 effect를 숨길 수 없음',
      code: component(`function useScroll() {} useScroll(); useEffect(${setup}, []);`),
      errors: [{ messageId: 'customHook' }],
    },
    {
      name: 'import한 커스텀 Hook의 별칭도 금지',
      code: component(
        `scroll(); useEffect(${setup}, []);`,
        "import { useEffect } from 'react'; import { useScroll as scroll } from './hooks';",
      ),
      errors: [{ messageId: 'customHook' }],
    },
    {
      name: 'namespace 커스텀 Hook도 금지',
      code: component(
        `hooks.useScroll(); useEffect(${setup}, []);`,
        "import { useEffect } from 'react'; import * as hooks from './hooks';",
      ),
      errors: [{ messageId: 'customHook' }],
    },
    {
      name: '커스텀 Hook만 호출해도 실패',
      code: component('useScroll();'),
      errors: [{ messageId: 'effectCount' }, { messageId: 'customHook' }],
    },
    {
      name: 'React import 별칭을 지역 매개변수로 가려도 effect로 세지 않음',
      code: `import { useEffect as effect } from 'react';
        export function ScrollHeaderPlugin(effect) { effect(${setup}, []); return null; }`,
      errors: [{ messageId: 'effectCount', data: { name: 'ScrollHeaderPlugin', count: 0 } }],
    },
    {
      name: 'React 외부의 같은 이름을 effect로 세지 않음',
      code: component(`useEffect(${setup}, []);`, "import { useEffect } from './other';"),
      errors: [{ messageId: 'effectCount' }, { messageId: 'customHook' }],
    },
    {
      name: '조건부 alias effect 호출 금지',
      code: component(`if (enabled) effect(${setup}, []);`, "import { useEffect as effect } from 'react';"),
      errors: [{ messageId: 'topLevel' }],
    },
    ...[
      '() => { install(); }',
      '() => { return undefined; }',
      '() => { return null; }',
      '() => { const nested = () => { return () => stop(); }; nested(); }',
    ].map((callback) => ({
      name: `cleanup을 반환하지 않는 ${callback}`,
      code: component(`useEffect(${callback}, []);`),
      errors: [{ messageId: 'cleanup' }],
    })),
    {
      name: '확인할 수 없는 외부 callback은 명시적으로 호출·반환하도록 요구',
      code: component(
        'useEffect(install, []);',
        "import { useEffect } from 'react'; import { install } from './helper';",
      ),
      errors: [{ messageId: 'callback' }],
    },
    {
      name: 'async effect는 cleanup 반환으로 세지 않음',
      code: component('useEffect(async () => install(), []);'),
      errors: [{ messageId: 'callback' }],
    },
    {
      name: 'memo 내부의 이름 없는 컴포넌트',
      code: "import { memo } from 'react'; export const ScrollHeaderPlugin = memo(() => null);",
      errors: [{ messageId: 'effectCount' }],
    },
    {
      name: '헤더와 무관한 SidebarPlugin도 공통 검사',
      code: `import { useEffect } from 'react';
        export function SidebarPlugin() { useEffect(${setup}, []); useEffect(${setup}, []); return null; }`,
      errors: [{ messageId: 'effectCount' }],
    },
    {
      name: '타입 선언 없는 커스텀 Plugin도 suffix로 검사',
      code: 'export const FocusPlugin = () => null;',
      errors: [{ messageId: 'effectCount' }],
    },
  ],
});
