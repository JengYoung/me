import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Link from 'next/link';
import { Header } from './header';
import { ScrollHeaderPlugin } from './scroll-header-plugin';

const meta = {
  title: 'Shared/Layout/Header',
  component: Header,
  args: {
    title: '기록',
    leftChildren: (
      <Link href="/" className="rounded-4 text-title-4 focus-visible:outline-ring">
        블로그
      </Link>
    ),
    rightChildren: <span className="text-body-3 text-ink-muted">일상과 개발</span>,
  },
  argTypes: {
    title: { control: 'text' },
    leftChildren: { control: false },
    rightChildren: { control: false },
    plugin: { control: false },
    className: { control: false },
  },
  render: (args) => (
    <>
      <Header {...args} />
      <main className="min-h-svh pt-64px">
        <p className="p-24px text-body-2 text-ink-secondary">높이 64px의 고정 헤더와 본문 영역입니다.</p>
      </main>
    </>
  ),
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongTitle: Story = {
  args: { title: '긴 제목이 들어와도 좌우 영역을 유지하며 말줄임으로 표시합니다' },
};

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile', isRotated: false } },
};

export const WithScrollPlugin: Story = {
  args: { plugin: ScrollHeaderPlugin },
  parameters: {
    docs: {
      description: {
        story: '아래로 스크롤하면 헤더가 숨겨지고, 위로 스크롤하거나 헤더에 키보드 포커스를 주면 다시 나타납니다.',
      },
    },
  },
  render: (args) => (
    <>
      <Header {...args} />
      <main className="pt-64px">
        <div className="grid gap-24px p-24px">
          {Array.from({ length: 12 }, (_, index) => (
            <section key={index} className="grid gap-16px rounded-16 bg-bg-canvas p-32px">
              <h2 className="text-title-2">스크롤 영역 {index + 1}</h2>
              <p className="text-body-2 text-ink-secondary">
                아래로 내린 뒤 위로 올려 헤더의 노출 상태를 확인하세요. 테마와 화면 크기도 도구 모음에서 변경할 수
                있습니다.
              </p>
            </section>
          ))}
        </div>
      </main>
    </>
  ),
};
