import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useId, useState } from 'react';
import { AnimatedCharacter } from './animated-character';
import { Character } from './character';
import { GHOST_PUPPY_MOTIONS } from './character-animation';
import { GHOST_PUPPY_VARIANTS } from './character.generated';

const meta = {
  title: 'Shared/Character',
  component: AnimatedCharacter,
  args: {
    expression: 'neutral',
    size: 240,
    playing: true,
    speed: 1,
    loop: true,
    showEffects: true,
    decorative: false,
    replayKey: 0,
  },
  argTypes: {
    expression: { options: GHOST_PUPPY_VARIANTS.map(({ expression }) => expression), control: 'select' },
    size: { control: { type: 'number', min: 1 } },
    playing: { control: 'boolean' },
    speed: { control: { type: 'range', min: 0.1, max: 3, step: 0.1 } },
    loop: { control: 'boolean' },
    showEffects: { control: 'boolean' },
    decorative: { control: 'boolean' },
    replayKey: { control: { type: 'number', min: 0, step: 1 } },
    className: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          '캐릭터의 표정 11종과 애니메이션입니다. Playground의 Controls에서 표정·재생·속도·반복·효과를 바꿀 수 있습니다. 화면 밖과 숨겨진 탭에서는 일시정지하며, 기기의 모션 감소 설정을 따릅니다.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-svh rounded-24 bg-bg-canvas p-24px font-sans text-ink mobile:p-16px">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AnimatedCharacter>;

export default meta;
type Story = StoryObj<typeof meta>;

const buttonClass =
  'rounded-16 bg-action-primary-bg px-16px py-12px text-title-4 text-action-primary-fg hover:bg-action-primary-hover active:bg-action-primary-pressed focus-visible:outline-2 focus-visible:outline-ring';
const fieldClass =
  'rounded-12 border border-border bg-bg-surface px-16px py-12px text-body-2 text-ink focus-visible:outline-2 focus-visible:outline-ring';

export const Gallery: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <section className="flex flex-col gap-24px" aria-label="캐릭터 표정 도감">
      <header className="flex flex-col gap-8px">
        <h1 className="text-heading-5">젱영</h1>
        <p className="text-body-2 text-ink-secondary">기본형과 열 가지 감정. 눈과 귀로 마음을 표현해요.</p>
      </header>
      <div className="grid gap-24px mobile:grid-cols-1 desktop:grid-cols-3">
        {GHOST_PUPPY_VARIANTS.map(({ expression, label, caption, src }) => (
          <article
            key={expression}
            className="flex flex-col items-center gap-16px rounded-24 border border-border bg-bg-surface p-24px"
          >
            <Character expression={expression} size={240} className="h-auto max-w-full" decorative />
            <div className="flex flex-col gap-4px text-center">
              <h2 className="text-title-2">{label}</h2>
              <p className="text-body-3 text-ink-secondary">{caption}</p>
            </div>
            <a className={buttonClass} href={src} download aria-label={`${label} SVG 다운로드`}>
              SVG 다운로드
            </a>
          </article>
        ))}
      </div>
    </section>
  ),
};

function AnimationGalleryExample() {
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [loop, setLoop] = useState(true);
  const [showEffects, setShowEffects] = useState(true);
  const [replayKey, setReplayKey] = useState(0);
  const speedId = useId();

  return (
    <section className="flex flex-col gap-24px" aria-label="표정별 애니메이션">
      <header className="flex flex-col gap-8px">
        <h1 className="text-heading-5">둥실둥실, 열한 가지 움직임</h1>
        <p className="text-body-2 text-ink-secondary">
          표정마다 다른 움직임을 비교해 보세요. 기기의 모션 감소 설정이 켜져 있으면 정지한 모습으로 보여요.
        </p>
      </header>
      <div className="flex flex-wrap items-center gap-16px rounded-24 border border-border bg-bg-surface p-24px">
        <button type="button" className={buttonClass} onClick={() => setPlaying((value) => !value)}>
          {playing ? '전체 일시정지' : '전체 재생'}
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() => {
            setPlaying(true);
            setReplayKey((value) => value + 1);
          }}
        >
          처음부터 재생
        </button>
        <label className="flex flex-wrap items-center gap-8px text-body-2" htmlFor={speedId}>
          재생 속도
          <select
            id={speedId}
            className={fieldClass}
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
          >
            <option value={0.5}>0.5배</option>
            <option value={1}>1배</option>
            <option value={1.5}>1.5배</option>
            <option value={2}>2배</option>
          </select>
        </label>
        <label className="flex cursor-pointer items-center gap-8px py-12px text-body-2">
          <input
            type="checkbox"
            checked={loop}
            onChange={(event) => setLoop(event.target.checked)}
            className="accent-action-primary-bg focus-visible:outline-2 focus-visible:outline-ring"
          />
          반복 재생
        </label>
        <label className="flex cursor-pointer items-center gap-8px py-12px text-body-2">
          <input
            type="checkbox"
            checked={showEffects}
            onChange={(event) => setShowEffects(event.target.checked)}
            className="accent-action-primary-bg focus-visible:outline-2 focus-visible:outline-ring"
          />
          효과 표시
        </label>
      </div>
      <div className="grid gap-24px mobile:grid-cols-1 desktop:grid-cols-3">
        {GHOST_PUPPY_VARIANTS.map(({ expression, label }) => (
          <article
            key={expression}
            className="flex flex-col items-center gap-16px rounded-24 border border-border bg-bg-surface p-24px"
          >
            <AnimatedCharacter
              expression={expression}
              size={240}
              playing={playing}
              speed={speed}
              loop={loop}
              showEffects={showEffects}
              replayKey={replayKey}
              className="h-auto max-w-full"
              decorative
            />
            <h2 className="text-title-2">{label}</h2>
            <p className="text-center text-body-3 text-ink-secondary">{GHOST_PUPPY_MOTIONS[expression].description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export const AnimationGallery: Story = {
  parameters: { controls: { disable: true } },
  render: () => <AnimationGalleryExample />,
};

export const Playground: Story = {
  render: (args) => (
    <section
      className="flex flex-col items-center gap-24px rounded-24 bg-bg-surface p-24px"
      aria-label="캐릭터 플레이그라운드"
    >
      <h1 className="text-heading-5">오늘의 표정</h1>
      <AnimatedCharacter {...args} className="h-auto max-w-full" />
    </section>
  ),
};

export const LightAndDark: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <section className="grid gap-24px mobile:grid-cols-1 desktop:grid-cols-2" aria-label="Light와 Dark 비교">
      {(['light', 'dark'] as const).map((theme) => (
        <article
          key={theme}
          data-theme={theme}
          className="flex flex-col items-center gap-16px rounded-24 border border-border bg-bg-surface p-24px text-ink"
        >
          <h2 className="text-title-2">{theme === 'light' ? 'Light' : 'Dark'}</h2>
          <AnimatedCharacter expression="neutral" size={240} className="h-auto max-w-full" decorative />
          <p className="text-body-3 text-ink-secondary">어떤 배경에서도 같은 젱영이에요.</p>
        </article>
      ))}
    </section>
  ),
};
