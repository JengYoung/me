import { act } from 'react';
import { expect, onTestFinished, test, vi } from 'vitest';
import { render } from 'vitest-browser-react/pure';
import gsap from 'gsap';
import { Character } from './character';
import { AnimatedCharacter } from './animated-character';
import { GHOST_PUPPY_VARIANTS } from './character.generated';
import { createCharacterAnimation, GHOST_PUPPY_MOTIONS } from './character-animation';

function svgIn(container: HTMLElement) {
  const svg = container.querySelector<SVGSVGElement>('svg');
  if (!svg) throw new Error('Expected a character SVG');
  return svg;
}

function drawing(svg: SVGSVGElement) {
  return [...svg.querySelectorAll('path')].map((path) => [path.getAttribute('d'), path.getAttribute('fill')]);
}

test.each(GHOST_PUPPY_VARIANTS)(
  '$expression 애니메이션은 원본 도형을 보존하며 해제 시 초기 모습으로 돌아온다',
  async ({ expression }) => {
    const { container } = await render(<Character expression={expression} />);
    const svg = svgIn(container);
    const original = svg.outerHTML;
    const originalDrawing = drawing(svg);
    const pose = svg.querySelector('[data-part="character-pose"]')!.getAttribute('transform');
    const animation = createCharacterAnimation(svg, expression, false);
    onTestFinished(animation.dispose);

    expect(animation.timeline.duration()).toBeCloseTo(GHOST_PUPPY_MOTIONS[expression].duration);
    expect(animation.timeline.repeat()).toBe(0);
    animation.timeline.progress(0.3);
    const middle = svg.querySelector('[data-part="character-motion"]')!.getAttribute('transform');
    animation.timeline.progress(1);
    const rest = svg.querySelector('[data-part="character-motion"]')!.getAttribute('transform');
    expect(middle).not.toEqual(rest);
    expect(drawing(svg)).toEqual(originalDrawing);
    expect(svg.querySelector('[data-part="character-pose"]')!.getAttribute('transform')).toBe(pose);

    animation.dispose();
    expect(svg.outerHTML).toBe(original);
    expect(gsap.getTweensOf([...svg.querySelectorAll('g')])).toHaveLength(0);
  },
);

test('다른 인스턴스를 변경하지 않고 효과 레이어가 없어도 반복 재생한다', async () => {
  const { container } = await render(
    <>
      <Character expression="love" showEffects={false} />
      <Character expression="love" />
    </>,
  );
  const [first, second] = container.querySelectorAll<SVGSVGElement>('svg');
  if (!first || !second) throw new Error('Expected two character instances');
  const other = second.outerHTML;
  const animation = createCharacterAnimation(first, 'love');
  onTestFinished(animation.dispose);

  expect(animation.timeline.repeat()).toBe(-1);
  animation.timeline.progress(0.4);
  expect(second.outerHTML).toBe(other);
  expect(first.querySelector('[data-part="effects"]')).toBeNull();
});

test('일시정지와 속도 변경은 현재 프레임을 유지한다', async () => {
  const { container } = await render(<Character expression="happy" />);
  const animation = createCharacterAnimation(svgIn(container), 'happy');
  onTestFinished(animation.dispose);
  animation.timeline.progress(0.35).pause();
  const time = animation.timeline.time();

  animation.timeline.timeScale(2);
  expect(animation.timeline.time()).toBe(time);
  expect(animation.timeline.paused()).toBe(true);
  animation.timeline.resume();
  expect(animation.timeline.time()).toBe(time);
  expect(animation.timeline.timeScale()).toBe(2);
});

function mockMotionEnvironment(reducedInitially = false) {
  let reduced = reducedInitially;
  const matchMedia = window.matchMedia.bind(window);
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) =>
      query === '(prefers-reduced-motion: no-preference)'
        ? {
            matches: !reduced,
            media: query,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
          }
        : matchMedia(query),
    ),
  );
  onTestFinished(() => {
    vi.unstubAllGlobals();
  });
  vi.stubGlobal('IntersectionObserver', undefined);

  return {
    async setReduced(value: boolean) {
      reduced = value;
      await act(async () => {
        gsap.matchMediaRefresh();
      });
    },
  };
}

test('StrictMode에서도 모션 감소 변경을 반영하고 unmount 시 애니메이션을 정리한다', async () => {
  const media = mockMotionEnvironment(true);
  const view = await render(<AnimatedCharacter expression="sad" />);
  const svg = svgIn(view.container);
  const original = svg.outerHTML;
  const targets = [...svg.querySelectorAll('g')];
  expect(gsap.getTweensOf(targets)).toHaveLength(0);

  await media.setReduced(false);
  expect(gsap.getTweensOf(targets).length).toBeGreaterThan(0);
  await media.setReduced(true);
  expect(gsap.getTweensOf(targets)).toHaveLength(0);
  expect(svg.outerHTML).toBe(original);

  await media.setReduced(false);
  await view.unmount();
  expect(gsap.getTweensOf(targets)).toHaveLength(0);
});

test('표정과 효과 표시를 변경하면 이전 애니메이션을 해제한다', async () => {
  mockMotionEnvironment();
  const view = await render(<AnimatedCharacter expression="happy" />);
  const oldTargets = [...svgIn(view.container).querySelectorAll('g')];
  expect(gsap.getTweensOf(oldTargets).length).toBeGreaterThan(0);

  await view.rerender(<AnimatedCharacter expression="sparkly" showEffects={false} />);
  expect(gsap.getTweensOf(oldTargets)).toHaveLength(0);
  const svg = svgIn(view.container);
  expect(svg).toHaveAttribute('data-expression', 'sparkly');
  expect(svg.querySelector('[data-part="effects"]')).toBeNull();
  expect(gsap.getTweensOf([...svg.querySelectorAll('g')]).length).toBeGreaterThan(0);
});

test('재생·속도·화면 노출·탭 가시성을 바꿔도 재생 위치를 유지하고 구독을 해제한다', async () => {
  mockMotionEnvironment();
  const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
  onTestFinished(() => hidden.mockRestore());
  let intersect!: IntersectionObserverCallback;
  const disconnects: Array<ReturnType<typeof vi.fn>> = [];
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        intersect = callback;
        disconnects.push(this.disconnect);
      }
      observe = vi.fn();
      disconnect = vi.fn();
    },
  );
  const setVisible = (isIntersecting: boolean) =>
    intersect([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver);
  const view = await render(<AnimatedCharacter expression="happy" />);
  const body = svgIn(view.container).querySelector('[data-part="character-motion"]')!;
  const timeline = gsap.getTweensOf(body)[0]!.parent!;
  expect(timeline.paused()).toBe(true);
  setVisible(true);
  expect(timeline.paused()).toBe(false);
  // 비동기 rerender를 기다리는 동안 프레임이 진행하지 않도록 먼저 고정한다.
  timeline.pause().time(1);

  await view.rerender(<AnimatedCharacter expression="happy" playing={false} speed={2} />);
  expect(gsap.getTweensOf(body)[0]!.parent).toBe(timeline);
  expect(timeline.paused()).toBe(true);
  expect(timeline.time()).toBe(1);
  expect(timeline.timeScale()).toBe(2);

  hidden.mockReturnValue(true);
  document.dispatchEvent(new Event('visibilitychange'));
  await view.rerender(<AnimatedCharacter expression="happy" playing speed={2} />);
  expect(timeline.paused()).toBe(true);
  hidden.mockReturnValue(false);
  document.dispatchEvent(new Event('visibilitychange'));
  expect(timeline.paused()).toBe(false);
  expect(timeline.time()).toBe(1);

  setVisible(false);
  expect(timeline.paused()).toBe(true);
  setVisible(true);
  expect(timeline.paused()).toBe(false);
  expect(timeline.time()).toBe(1);
  await view.unmount();
  expect(disconnects.length).toBeGreaterThan(0);
  for (const disconnect of disconnects) expect(disconnect).toHaveBeenCalledOnce();
  expect(gsap.getTweensOf(body)).toHaveLength(0);
});
