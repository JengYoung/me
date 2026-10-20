import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CloseIcon } from './index';

const meta = {
  title: 'Shared/Icons/Close',
  component: CloseIcon,
  args: {
    className: 'size-24px',
    'aria-hidden': true,
    focusable: false,
  },
  argTypes: {
    className: {
      control: 'select',
      options: ['size-16px', 'size-20px', 'size-24px', 'size-32px'],
      description: '기존 숫자 토큰으로 크기를 지정합니다. 색상은 부모의 currentColor를 상속합니다.',
    },
    'aria-hidden': {
      control: 'boolean',
      description: '버튼의 이름을 반복해서 읽지 않도록 장식용 아이콘은 숨깁니다.',
    },
    'aria-label': { control: 'text' },
    role: { control: false },
    focusable: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'close.svg?react를 SVGO·SVGR로 변환한 아이콘입니다. SVG 자체에는 크기·테마·접근성 이름을 고정하지 않습니다. 도구 모음에서 Light/Dark를 전환할 수 있습니다.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-24px text-ink">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CloseIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  parameters: {
    controls: { exclude: ['className'] },
    docs: {
      description: {
        story: '16·20·24·32px 크기를 비교합니다. 실제 클릭 영역의 크기는 아이콘을 감싸는 버튼에서 확보합니다.',
      },
    },
  },
  render: (args) => (
    <div className="flex flex-wrap items-end gap-24px">
      {[
        { label: '16px', className: 'size-16px' },
        { label: '20px', className: 'size-20px' },
        { label: '24px', className: 'size-24px' },
        { label: '32px', className: 'size-32px' },
      ].map(({ label, className }) => (
        <figure key={label} className="grid justify-items-center gap-8px">
          <CloseIcon {...args} className={className} />
          <figcaption className="text-body-3 text-ink-secondary">{label}</figcaption>
        </figure>
      ))}
    </div>
  ),
};

export const InheritedColor: Story = {
  parameters: {
    docs: {
      description: {
        story: '아이콘에 색상을 지정하지 않아도 부모의 Semantic 텍스트 색상을 상속합니다.',
      },
    },
  },
  render: (args) => (
    <div className="grid gap-16px">
      {[
        { label: '기본 · text-ink', className: 'text-ink' },
        { label: '보조 · text-ink-secondary', className: 'text-ink-secondary' },
        { label: '약한 강조 · text-ink-muted', className: 'text-ink-muted' },
      ].map(({ label, className }) => (
        <div key={className} className={`flex items-center gap-12px ${className}`}>
          <CloseIcon {...args} />
          <span className="text-body-3">{label}</span>
        </div>
      ))}
    </div>
  ),
};

export const IconButton: Story = {
  parameters: {
    controls: { include: ['className'] },
    docs: {
      description: {
        story:
          '48px 버튼에 접근성 이름을 제공하고 내부 아이콘은 숨깁니다. Tab 키로 포커스 표시를 확인할 수 있습니다. 실제 닫기 동작은 버튼을 사용하는 화면에서 연결합니다.',
      },
    },
  },
  render: (args) => (
    <button
      type="button"
      aria-label="닫기"
      className="inline-flex size-48px cursor-pointer items-center justify-center rounded-full text-ink hover:bg-bg-subtle active:bg-bg-subtle focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <CloseIcon className={args.className} aria-hidden="true" focusable="false" />
    </button>
  ),
};

export const AccessibleImage: Story = {
  args: {
    'aria-hidden': false,
    role: 'img',
    'aria-label': '닫기 아이콘',
  },
  parameters: {
    docs: {
      description: {
        story:
          '아이콘 자체를 읽어야 할 때는 role="img"와 이름을 제공합니다. 이미지 역할만 부여하며, 클릭 가능한 닫기 동작에는 Icon Button 예제처럼 버튼을 사용합니다.',
      },
    },
  },
};
