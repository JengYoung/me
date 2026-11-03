import { renderToString } from 'react-dom/server';
import { expect, test } from 'vitest';
import { Header } from './header';
import { ScrollHeaderPlugin } from './scroll-header-plugin';
import { Sidebar } from './sidebar';

test.each([null, ScrollHeaderPlugin])(
  'Header는 plugin=%s에서도 브라우저 전역 없이 제목과 콘텐츠를 렌더한다',
  (plugin) => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
    const html = renderToString(
      <Header title="기록" plugin={plugin} leftChildren={<button type="button">메뉴</button>} />,
    );

    expect(html).toContain('<header');
    expect(html).toContain('기록</h1>');
    expect(html).toContain('메뉴</button>');
    expect(html).toContain('data-scrolled="false"');
  },
);

test.each([false, true])(
  'Sidebar는 defaultOpen=%s에서도 DOM 없이 트리거를 렌더하고 portal은 클라이언트에 맡긴다',
  (defaultOpen) => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
    const html = renderToString(
      <Sidebar.Root id="navigation" defaultOpen={defaultOpen}>
        <Sidebar.Trigger>메뉴 열기</Sidebar.Trigger>
        <Sidebar.Content title="둘러보기">메뉴 내용</Sidebar.Content>
      </Sidebar.Root>,
    );

    expect(html).toContain('메뉴 열기</button>');
    expect(html).toContain(`aria-expanded="${defaultOpen}"`);
    expect(html).toContain('aria-controls="navigation-content"');
    expect(html).not.toContain('role="dialog"');
  },
);
