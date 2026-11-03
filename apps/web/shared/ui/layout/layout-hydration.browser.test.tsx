import { act, StrictMode } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { Header } from './header';
import { ScrollHeaderPlugin } from './scroll-header-plugin';
import { Sidebar } from './sidebar';

test('hydration에서 서버 헤더·트리거를 재사용하고 각 Sidebar의 ARIA ID를 고유하게 유지한다', async ({
  onTestFinished,
}) => {
  // 수동 hydrateRoot는 render helper를 통하지 않으므로 act 환경도 직접 관리한다.
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  onTestFinished(() => {
    vi.unstubAllGlobals();
  });
  const container = document.createElement('div');
  onTestFinished(() => container.remove());
  document.body.append(container);
  const errors = vi.spyOn(console, 'error');
  onTestFinished(() => errors.mockRestore());
  const onRecoverableError = vi.fn();
  const tree = (
    <StrictMode>
      <Header title="기록" plugin={ScrollHeaderPlugin} />
      <main className="pt-64px">
        {['주 메뉴', '설정'].map((title) => (
          <Sidebar.Root key={title}>
            <Sidebar.Trigger>{title} 열기</Sidebar.Trigger>
            <Sidebar.Content title={title}>{title} 내용</Sidebar.Content>
          </Sidebar.Root>
        ))}
      </main>
    </StrictMode>
  );
  container.innerHTML = renderToString(tree);
  const serverHeader = container.querySelector('header');
  const serverTriggers = [...container.querySelectorAll('button')];
  const serverIds = serverTriggers.map((trigger) => trigger.getAttribute('aria-controls'));
  expect(serverHeader).not.toBeNull();
  expect(serverTriggers).toHaveLength(2);
  expect(new Set(serverIds).size).toBe(2);
  let root: Root | undefined;
  onTestFinished(async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    if (root) await act(async () => root?.unmount());
    expect(errors).not.toHaveBeenCalled();
  });

  await act(async () => {
    root = hydrateRoot(container, tree, { onRecoverableError });
  });
  // 네이티브 입력은 브라우저가 처리하며 locator의 자동 대기로 갱신을 확인한다.
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', false);

  expect(page.getByRole('banner').element()).toBe(serverHeader);
  const triggers = [
    page.getByRole('button', { name: '주 메뉴 열기' }),
    page.getByRole('button', { name: '설정 열기' }),
  ];
  for (const [index, trigger] of triggers.entries()) {
    expect(trigger.element()).toBe(serverTriggers[index]);
    expect(trigger.element().getAttribute('aria-controls')).toBe(serverIds[index]);
  }
  await triggers[0]!.click();
  const dialog = page.getByRole('dialog', { name: '주 메뉴' });
  await expect.element(dialog).toBeVisible();
  expect(dialog.element().id).toBe(serverIds[0]);
  expect(dialog.element()).toHaveAttribute(
    'aria-labelledby',
    page.getByRole('heading', { name: '주 메뉴' }).element().id,
  );
  expect(onRecoverableError).not.toHaveBeenCalled();
  expect(errors).not.toHaveBeenCalled();
});
