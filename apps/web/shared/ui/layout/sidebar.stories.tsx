import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Link from 'next/link';
import { expect, fn, userEvent, within, waitFor } from 'storybook/test';
import { Sidebar } from './sidebar';

const meta = {
  title: 'Shared/Layout/Sidebar',
  component: Sidebar.Root,
  args: {
    defaultOpen: false,
    onOpenChange: fn(),
    children: (
      <>
        <Sidebar.Trigger aria-label="사이드바 열기">
          <span className="text-body-3">메뉴</span>
        </Sidebar.Trigger>
        <Sidebar.Content title="둘러보기">
          <nav aria-label="블로그 메뉴" className="grid gap-16px">
            <Link
              href="/"
              className="rounded-8 px-16px py-12px text-title-4 hover:bg-bg-subtle focus-visible:outline-ring"
            >
              홈으로
            </Link>
            <p className="text-body-2 text-ink-secondary">Escape 키, 닫기 버튼 또는 배경을 눌러 닫을 수 있습니다.</p>
          </nav>
        </Sidebar.Content>
      </>
    ),
  },
  argTypes: {
    children: { control: false },
    open: { control: false },
    defaultOpen: { control: false },
    initialFocus: { control: false },
    returnFocus: { control: false },
  },
  render: (args) => (
    <div className="p-24px">
      <Sidebar.Root {...args} />
    </div>
  ),
} satisfies Meta<typeof Sidebar.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InitiallyOpen: Story = {
  args: { defaultOpen: true },
};

export const Mobile: Story = {
  args: { defaultOpen: true },
  globals: { viewport: { value: 'mobile', isRotated: false } },
};

export const OpenAndClose: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Sidebar는 document.body에 portal을 렌더링합니다.
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: '사이드바 열기' });

    await userEvent.click(trigger);
    await expect(await body.findByRole('dialog', { name: '둘러보기' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog', { name: '둘러보기' })).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();

    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole('button', { name: '사이드바 닫기' }));
    await waitFor(() => expect(body.queryByRole('dialog', { name: '둘러보기' })).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};
