import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Fragment } from 'react';
import { articleMdxComponents } from '../mdx-components';
import CodeExample from './code.example.md';
import { ArticleCallout } from './article-callout';
import { ArticleCodeBlock } from './article-code-block';
import {
  ArticleCode,
  ArticleDeleted,
  ArticleEmphasis,
  ArticleHeading,
  ArticleLink,
  ArticleListItem,
  ArticleOrderedList,
  ArticleParagraph,
  ArticleQuote,
  ArticleStrong,
  ArticleTable,
  ArticleTableBody,
  ArticleTableCell,
  ArticleTableHead,
  ArticleTableHeader,
  ArticleTableRow,
  ArticleTaskCheckbox,
  ArticleUnorderedList,
} from './article-elements';
import { ArticleImage } from './article-image';
import { ArticleProse } from './article-prose';

const meta = {
  title: 'Article/본문 컴포넌트',
  component: ArticleProse,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <main className="mx-auto max-w-3xl">
        <Story />
      </main>
    ),
  ],
  argTypes: { children: { control: false } },
} satisfies Meta<typeof ArticleProse>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllElements: Story = {
  render: () => (
    <ArticleProse>
      <ArticleHeading as="h2" id="reading-history">
        읽는 사람을 위한 기록
      </ArticleHeading>
      <ArticleParagraph>
        <ArticleStrong>같은 환경에서 무엇을 해결했는지</ArticleStrong> 남기고,
        <ArticleEmphasis>설명이 바뀐 과정</ArticleEmphasis>도 읽을 수 있게 합니다. 버전은{' '}
        <ArticleCode>1.0.0</ArticleCode>처럼 기록합니다.
      </ArticleParagraph>
      <ArticleQuote source={{ label: '기록의 원칙', href: '#reading-history' }}>
        <ArticleParagraph>새로운 설명을 쓰더라도 이전의 맥락을 지우지 않습니다.</ArticleParagraph>
      </ArticleQuote>
      <ArticleHeading as="h3" id="links-and-lists">
        링크와 목록
      </ArticleHeading>
      <ArticleParagraph>
        <ArticleLink href="#code">아래 코드로 이동</ArticleLink>하거나{' '}
        <ArticleLink href="https://mdxjs.com/" target="_blank">
          MDX 문서
        </ArticleLink>
        를 읽을 수 있습니다.
        <ArticleDeleted>이전 문장</ArticleDeleted>의 취소선도 지원합니다.
      </ArticleParagraph>
      <ArticleOrderedList start={2}>
        <ArticleListItem>문제를 기록합니다.</ArticleListItem>
        <ArticleListItem>
          해결 과정과 확인한 결과를 남깁니다.
          <ArticleUnorderedList>
            <ArticleListItem>환경에 따라 결론이 달라질 수 있습니다.</ArticleListItem>
          </ArticleUnorderedList>
        </ArticleListItem>
      </ArticleOrderedList>
      <ArticleUnorderedList className="contains-task-list">
        <ArticleListItem>
          <ArticleTaskCheckbox checked aria-label="환경 기록 완료" />
          환경 기록
        </ArticleListItem>
        <ArticleListItem>
          <ArticleTaskCheckbox aria-label="후속 기록 미완료" />
          후속 기록
        </ArticleListItem>
      </ArticleUnorderedList>
      <ArticleCallout title="이전 버전의 이미지">
        <ArticleParagraph>바뀌지 않은 이미지는 같은 파일을 계속 참조합니다.</ArticleParagraph>
      </ArticleCallout>
      <ArticleImage
        src="/characters/character/00-neutral.svg"
        alt="보라색 유령 강아지 젱영"
        caption="기존 캐릭터 자산을 사용한 이미지 예시"
        pcWidth="1/2"
        moWidth="full"
      />
      <ArticleHeading as="h3" id="code">
        코드와 표
      </ArticleHeading>
      <CodeExample components={{ ...articleMdxComponents, wrapper: Fragment }} />
      <ArticleTable label="콘텐츠 버전 분류">
        <ArticleTableHead>
          <ArticleTableRow>
            <ArticleTableHeader>자리</ArticleTableHeader>
            <ArticleTableHeader>변경</ArticleTableHeader>
          </ArticleTableRow>
        </ArticleTableHead>
        <ArticleTableBody>
          <ArticleTableRow>
            <ArticleTableCell>X</ArticleTableCell>
            <ArticleTableCell>환경과 설명의 전제가 달라짐</ArticleTableCell>
          </ArticleTableRow>
          <ArticleTableRow>
            <ArticleTableCell>Y</ArticleTableCell>
            <ArticleTableCell>같은 환경의 잘못된 사실을 수정</ArticleTableCell>
          </ArticleTableRow>
          <ArticleTableRow>
            <ArticleTableCell>Z</ArticleTableCell>
            <ArticleTableCell>오탈자와 올바른 문장을 편집</ArticleTableCell>
          </ArticleTableRow>
        </ArticleTableBody>
      </ArticleTable>
    </ArticleProse>
  ),
};

export const ResponsiveImage: StoryObj<typeof ArticleImage> = {
  render: (args) => (
    <ArticleProse>
      <ArticleImage {...args} />
    </ArticleProse>
  ),
  args: {
    src: '/characters/character/00-neutral.svg',
    alt: '보라색 유령 강아지 젱영',
    caption: 'PC 절반, 모바일 전체 너비',
    pcWidth: '1/2',
    moWidth: 'full',
  },
  argTypes: {
    pcWidth: { control: 'select', options: ['auto', 'full', '3/4', '2/3', '1/2'] },
    moWidth: { control: 'select', options: ['auto', 'full', '3/4', '2/3', '1/2'] },
    caption: { control: 'text' },
    inline: { control: 'boolean' },
  },
};

export const CalloutTones: Story = {
  render: () => (
    <ArticleProse>
      {(['info', 'warning', 'success', 'error'] as const).map((tone) => (
        <ArticleCallout key={tone} tone={tone} title="같은 맥락, 다른 강조">
          <ArticleParagraph>Light와 Dark에서 같은 의미의 토큰을 사용합니다.</ArticleParagraph>
        </ArticleCallout>
      ))}
    </ArticleProse>
  ),
};

export const LongCode: Story = {
  render: () => (
    <ArticleProse>
      <ArticleCodeBlock
        language="text"
        code={'길이가 긴 코드도 줄바꿈을 바꾸지 않고 가로로 스크롤해서 읽고 복사할 수 있습니다. '.repeat(4)}
      />
    </ArticleProse>
  ),
};

export const HighlightedCode: Story = {
  render: () => <CodeExample components={articleMdxComponents} />,
};

export const Quotes: Story = {
  render: () => (
    <ArticleProse>
      <ArticleQuote source={{ label: '기록의 원칙', href: '#context' }}>
        <ArticleParagraph>새로운 설명을 쓰더라도 이전의 맥락을 지우지 않습니다.</ArticleParagraph>
      </ArticleQuote>
      <ArticleQuote>
        <ArticleParagraph>좋은 기록은 읽는 사람에게 닿는다.</ArticleParagraph>
      </ArticleQuote>
      <ArticleQuote source={{ label: '읽는 사람을 위한 기술 블로그 · 작성자의 기록' }}>
        <ArticleParagraph>
          어떤 환경에서 무엇을 해결했는지 남기는 일은, 같은 문제 앞에 선 누군가에게 출발점을 건네는 일입니다.
        </ArticleParagraph>
        <ArticleParagraph>
          시간이 흘러 설명이 달라져도, 그때의 질문과 판단은 다음 이야기를 이해하는 맥락으로 남습니다.
        </ArticleParagraph>
      </ArticleQuote>
      <ArticleParagraph id="context">문단과 출처는 기존 본문 글꼴로 이어집니다.</ArticleParagraph>
    </ArticleProse>
  ),
};
