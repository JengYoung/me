import { act } from 'react';
import { expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react/pure';
import { Header, type HeaderProps } from './header';
import { scrollHeaderPlugin } from './header-plugin.lib';
import { ScrollHeaderPlugin } from './scroll-header-plugin';

function ScrollPage({ plugin = null }: Pick<HeaderProps, 'plugin'>) {
  return (
    <>
      <Header title="기록" leftChildren={<button type="button">메뉴</button>} plugin={plugin} />
      <main className="pt-64px">
        {Array.from({ length: 40 }, (_, index) => (
          <p key={index} className="p-32px text-body-2">
            스크롤 확인 영역 {index + 1}
          </p>
        ))}
      </main>
    </>
  );
}

test('좌우 콘텐츠·제목과 header의 접근성 속성·이벤트를 전달한다', async () => {
  const onClick = vi.fn();
  const screen = await render(
    <Header
      aria-label="사이트 헤더"
      title="기록"
      leftChildren={<button type="button">메뉴</button>}
      rightChildren={<button type="button">검색</button>}
      onClick={onClick}
    />,
  );

  await expect.element(screen.getByRole('banner', { name: '사이트 헤더' })).toBeVisible();
  await expect.element(screen.getByRole('heading', { level: 1, name: '기록' })).toBeVisible();
  await expect.element(screen.getByRole('button', { name: '메뉴' })).toBeVisible();
  await screen.getByRole('button', { name: '검색' }).click();
  expect(onClick).toHaveBeenCalledTimes(1);

  await screen.rerender(<Header leftChildren={<button type="button">메뉴</button>} />);
  await expect.element(screen.getByRole('heading', { level: 1 })).not.toBeInTheDocument();
  await expect.element(screen.getByRole('button', { name: '메뉴' })).toBeVisible();
});

test('플러그인이 없으면 스크롤해도 헤더가 고정되어 있다', async ({ onTestFinished }) => {
  onTestFinished(() => window.scrollTo(0, 0));
  window.scrollTo(0, 0);
  const screen = await render(<ScrollPage />);
  const header = screen.getByRole('banner').element();

  window.scrollTo(0, 240);
  await expect.poll(() => window.scrollY).toBe(240);
  expect(header.getBoundingClientRect().top).toBe(0);
  expect(header).toHaveAttribute('data-scrolled', 'false');
  expect(header).toHaveAttribute('data-border-visible', 'true');
});

test('아래로 스크롤하면 높이만큼 숨고 위로 올리면 드러나며 맨 위에서 복원된다', async ({ onTestFinished }) => {
  onTestFinished(() => window.scrollTo(0, 0));
  window.scrollTo(0, 0);
  const screen = await render(<ScrollPage plugin={ScrollHeaderPlugin} />);
  const header = screen.getByRole('banner').element();
  const height = header.getBoundingClientRect().height;
  expect(height).toBeGreaterThan(0);
  expect(header).toHaveAttribute('data-border-visible', 'false');

  window.scrollTo(0, 240);
  await expect.poll(() => header.getBoundingClientRect().top).toBe(-height);
  expect(header).toHaveAttribute('data-scrolled', 'true');
  expect(header).toHaveAttribute('data-border-visible', 'true');

  window.scrollTo(0, 224);
  await expect.poll(() => header.getBoundingClientRect().top).toBe(-height + 16);

  window.scrollTo(0, 0);
  await expect.poll(() => header.getBoundingClientRect().top).toBe(0);
  expect(header).toHaveAttribute('data-scrolled', 'false');
  expect(header).toHaveAttribute('data-border-visible', 'false');
});

test('키보드 포커스가 들어오면 헤더를 노출하고 포커스가 남아 있는 동안 숨기지 않는다', async ({ onTestFinished }) => {
  onTestFinished(() => window.scrollTo(0, 0));
  window.scrollTo(0, 0);
  const screen = await render(<ScrollPage plugin={ScrollHeaderPlugin} />);
  const header = screen.getByRole('banner').element();
  window.scrollTo(0, 240);
  await expect.poll(() => header.getBoundingClientRect().bottom).toBe(0);

  await userEvent.tab();
  await expect.element(screen.getByRole('button', { name: '메뉴' })).toHaveFocus();
  await expect.poll(() => header.getBoundingClientRect().top).toBe(0);

  window.scrollTo(0, 480);
  await expect.poll(() => window.scrollY).toBe(480);
  expect(header.getBoundingClientRect().top).toBe(0);
});

test('pageshow 이벤트에서 현재 스크롤 위치를 기준으로 헤더를 다시 노출한다', async ({ onTestFinished }) => {
  onTestFinished(() => window.scrollTo(0, 0));
  window.scrollTo(0, 0);
  const screen = await render(<ScrollPage plugin={ScrollHeaderPlugin} />);
  const header = screen.getByRole('banner').element();
  window.scrollTo(0, 240);
  await expect.poll(() => header.getBoundingClientRect().bottom).toBe(0);

  window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
  expect(header.getBoundingClientRect().top).toBe(0);
  expect(header).toHaveAttribute('data-scrolled', 'true');

  window.scrollTo(0, 256);
  await expect.poll(() => header.getBoundingClientRect().top).toBe(-16);
});

test('플러그인을 제거하면 원래 속성과 스타일을 복원하고 이전 구독이 DOM을 바꾸지 않는다', async ({
  onTestFinished,
}) => {
  onTestFinished(() => window.scrollTo(0, 0));
  window.scrollTo(0, 0);
  const screen = await render(<ScrollPage plugin={ScrollHeaderPlugin} />);
  const header = screen.getByRole('banner').element() as HTMLElement;
  window.scrollTo(0, 240);
  await expect.poll(() => header.getBoundingClientRect().bottom).toBe(0);

  await screen.rerender(<ScrollPage />);
  expect(header.style.transform).toBe('');
  expect(header).toHaveAttribute('data-scrolled', 'false');
  expect(header).toHaveAttribute('data-border-visible', 'true');
  window.scrollTo(0, 480);
  await expect.poll(() => window.scrollY).toBe(480);
  await act(async () => {
    window.dispatchEvent(new PageTransitionEvent('pageshow'));
    header.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
  });
  expect(header.style.transform).toBe('');
  expect(header).toHaveAttribute('data-scrolled', 'false');

  await screen.rerender(<ScrollPage plugin={ScrollHeaderPlugin} />);
  expect(header).toHaveAttribute('data-scrolled', 'true');
  expect(header.getBoundingClientRect().top).toBe(0);
});

test('직접 설치한 스크롤 효과는 기존 attribute와 important 우선순위를 보존한다', ({ onTestFinished }) => {
  const header = document.createElement('header');
  onTestFinished(() => header.remove());
  header.setAttribute('data-scrolled', 'original');
  header.style.setProperty('transform', 'none', 'important');
  document.body.append(header);
  const dispose = scrollHeaderPlugin(header);
  onTestFinished(() => dispose?.());

  expect(header).toHaveAttribute('data-border-visible');
  dispose?.();

  expect(header).toHaveAttribute('data-scrolled', 'original');
  expect(header).not.toHaveAttribute('data-border-visible');
  expect(header.style.getPropertyValue('transform')).toBe('none');
  expect(header.style.getPropertyPriority('transform')).toBe('important');
  window.dispatchEvent(new PageTransitionEvent('pageshow'));
  expect(header.style.getPropertyValue('transform')).toBe('none');
});
