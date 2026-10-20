import { createRef } from 'react';
import { expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react/pure';
import { Sidebar, type SidebarRootProps } from './sidebar';

function SidebarExample(props: Omit<SidebarRootProps, 'children'>) {
  return (
    <Sidebar.Root {...props}>
      <Sidebar.Trigger aria-label="사이드바 열기">메뉴</Sidebar.Trigger>
      <Sidebar.Content title="둘러보기">
        <button type="button">첫 항목</button>
        <button type="button">마지막 항목</button>
      </Sidebar.Content>
    </Sidebar.Root>
  );
}

test('트리거로 열고 제목·모달·ARIA 연결을 portal에 제공한다', async () => {
  const onOpenChange = vi.fn();
  const screen = await render(<SidebarExample onOpenChange={onOpenChange} />);
  const trigger = screen.getByRole('button', { name: '사이드바 열기' });
  await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();

  await trigger.click();

  const dialog = page.getByRole('dialog', { name: '둘러보기' });
  await expect.element(dialog).toBeVisible();
  expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true, { reason: 'trigger' });
  expect(trigger.element()).toHaveAttribute('aria-expanded', 'true');
  expect(trigger.element()).toHaveAttribute('aria-controls', dialog.element().id);
  expect(dialog.element()).toHaveAttribute('aria-modal', 'true');
  expect(dialog.element()).not.toHaveAttribute('aria-describedby');
  expect(dialog.element()).toHaveAttribute(
    'aria-labelledby',
    page.getByRole('heading', { name: '둘러보기' }).element().id,
  );
  expect(screen.container.contains(dialog.element())).toBe(false);
});

test.each(['escape', 'close-button', 'outside'] as const)(
  '%s로 닫으면 상태를 알리고 트리거로 포커스를 복원한다',
  async (reason) => {
    const onOpenChange = vi.fn();
    const screen = await render(<SidebarExample onOpenChange={onOpenChange} />);
    const trigger = screen.getByRole('button', { name: '사이드바 열기' });
    await trigger.click();
    await expect.element(page.getByRole('dialog', { name: '둘러보기' })).toBeVisible();

    if (reason === 'escape') await userEvent.keyboard('{Escape}');
    else if (reason === 'close-button') await page.getByRole('button', { name: '사이드바 닫기' }).click();
    else {
      // inert인 배경의 좌표에 실제 포인터를 보낸다. DOM click 이벤트를 합성하지 않는다.
      const backdrop = document.querySelector<HTMLElement>('[data-scope="drawer"][data-part="backdrop"]');
      expect(backdrop).not.toBeNull();
      await page.elementLocator(backdrop!).click({ position: { x: 8, y: 8 }, force: true });
    }

    await expect.element(page.getByRole('dialog', { name: '둘러보기' })).not.toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason });
    expect(onOpenChange).toHaveBeenCalledTimes(2);
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect.element(trigger).toHaveFocus();
  },
);

test('처음부터 열린 사이드바는 Tab·Shift+Tab 포커스를 내부에 유지한다', async () => {
  const onOpenChange = vi.fn();
  await render(<SidebarExample defaultOpen onOpenChange={onOpenChange} />);
  const close = page.getByRole('button', { name: '사이드바 닫기' });
  await expect.element(close).toHaveFocus();
  expect(onOpenChange).not.toHaveBeenCalled();

  await userEvent.tab();
  await expect.element(page.getByRole('button', { name: '첫 항목' })).toHaveFocus();
  await userEvent.tab();
  await expect.element(page.getByRole('button', { name: '마지막 항목' })).toHaveFocus();
  await userEvent.tab();
  await expect.element(close).toHaveFocus();
  await userEvent.tab({ shift: true });
  await expect.element(page.getByRole('button', { name: '마지막 항목' })).toHaveFocus();
});

test('제어 모드에서는 열기·닫기를 요청하고 open prop이 변경될 때 화면을 갱신한다', async () => {
  const onOpenChange = vi.fn();
  const screen = await render(<SidebarExample open={false} onOpenChange={onOpenChange} />);
  await screen.getByRole('button', { name: '사이드바 열기' }).click();
  expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true, { reason: 'trigger' });
  await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();

  await screen.rerender(<SidebarExample open onOpenChange={onOpenChange} />);
  await expect.element(page.getByRole('dialog', { name: '둘러보기' })).toBeVisible();
  await userEvent.keyboard('{Escape}');
  expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: 'escape' });
  await expect.element(page.getByRole('dialog', { name: '둘러보기' })).toBeVisible();

  await screen.rerender(<SidebarExample open={false} onOpenChange={onOpenChange} />);
  await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  await expect.element(screen.getByRole('button', { name: '사이드바 열기' })).toHaveFocus();
});

test('사용자가 지정한 초기·복귀 포커스와 닫기 버튼 이름을 적용한다', async () => {
  const initial = createRef<HTMLButtonElement>();
  const returning = createRef<HTMLButtonElement>();
  const screen = await render(
    <>
      <button type="button" ref={returning}>
        본문으로
      </button>
      <Sidebar.Root initialFocus={() => initial.current} returnFocus={() => returning.current}>
        <Sidebar.Trigger>메뉴 열기</Sidebar.Trigger>
        <Sidebar.Content title="설정" closeLabel="설정 닫기">
          <button type="button" ref={initial}>
            환경 설정
          </button>
        </Sidebar.Content>
      </Sidebar.Root>
    </>,
  );

  await screen.getByRole('button', { name: '메뉴 열기' }).click();
  await expect.element(page.getByRole('button', { name: '환경 설정' })).toHaveFocus();
  await page.getByRole('button', { name: '설정 닫기' }).click();
  await expect.element(screen.getByRole('button', { name: '본문으로' })).toHaveFocus();
});

test('비활성 트리거는 포인터 입력에도 사이드바를 열지 않는다', async () => {
  const onOpenChange = vi.fn();
  const screen = await render(
    <Sidebar.Root onOpenChange={onOpenChange}>
      <Sidebar.Trigger disabled>메뉴 열기</Sidebar.Trigger>
      <Sidebar.Content title="둘러보기">메뉴 내용</Sidebar.Content>
    </Sidebar.Root>,
  );
  const trigger = screen.getByRole('button', { name: '메뉴 열기' });
  await expect.element(trigger).toBeDisabled();
  await trigger.click({ force: true });
  expect(onOpenChange).not.toHaveBeenCalled();
  await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
});

test('열린 상태로 제거해도 배경 inert와 스크롤 잠금을 해제한다', async ({ onTestFinished }) => {
  const background = document.createElement('button');
  onTestFinished(() => background.remove());
  background.textContent = '배경 버튼';
  document.body.append(background);
  const onBackgroundClick = vi.fn();
  background.addEventListener('click', onBackgroundClick);
  onTestFinished(() => background.removeEventListener('click', onBackgroundClick));
  const elements = [document.documentElement, document.body];
  const previousStyles = elements.map((element) => ({
    overflow: element.style.getPropertyValue('overflow'),
    overflowPriority: element.style.getPropertyPriority('overflow'),
    overscroll: element.style.getPropertyValue('overscroll-behavior'),
  }));
  const screen = await render(<SidebarExample defaultOpen />);

  await expect.element(page.getByRole('dialog', { name: '둘러보기' })).toBeVisible();
  expect(background).toHaveAttribute('inert');
  for (const element of elements) expect(element.style.getPropertyValue('overflow')).toBe('hidden');

  await screen.unmount();

  expect(background).not.toHaveAttribute('inert');
  expect(
    elements.map((element) => ({
      overflow: element.style.getPropertyValue('overflow'),
      overflowPriority: element.style.getPropertyPriority('overflow'),
      overscroll: element.style.getPropertyValue('overscroll-behavior'),
    })),
  ).toEqual(previousStyles);
  await page.elementLocator(background).click();
  expect(onBackgroundClick).toHaveBeenCalledTimes(1);
});

test('배경을 눌러 닫을 때 뒤의 버튼을 누르지 않고 닫힌 뒤에는 포인터를 가로채지 않는다', async () => {
  const onBackgroundClick = vi.fn();
  const screen = await render(
    <>
      <button type="button" className="fixed bottom-0 left-0 size-48px" onClick={onBackgroundClick}>
        배경
      </button>
      <SidebarExample />
    </>,
  );
  const background = screen.getByRole('button', { name: '배경' });
  const backgroundElement = background.element();
  await screen.getByRole('button', { name: '사이드바 열기' }).click();
  await expect.element(page.getByRole('dialog', { name: '둘러보기' })).toBeVisible();

  await page.elementLocator(backgroundElement).click({ force: true });
  await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  expect(onBackgroundClick).not.toHaveBeenCalled();

  await background.click();
  expect(onBackgroundClick).toHaveBeenCalledTimes(1);
});
