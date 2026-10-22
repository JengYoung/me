import { Children, isValidElement } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Link as LinkIcon } from 'lucide-react';
import { ArticleImage, ArticleMarkdownImage } from './article-image';
import styles from './article.module.css';

type ElementProps<T extends keyof React.JSX.IntrinsicElements> = Omit<
  ComponentPropsWithoutRef<T>,
  'style' | 'className' | 'dangerouslySetInnerHTML'
>;

const HEADING_STYLES = {
  h1: 'text-heading-5 desktop:text-heading-3',
  h2: 'text-heading-6 desktop:text-heading-5',
  h3: 'text-title-2 desktop:text-title-1',
  h4: 'text-title-3',
  h5: 'text-title-4',
  h6: 'text-title-4',
} as const;

export type ArticleHeadingProps = ElementProps<'h2'> & { as?: keyof typeof HEADING_STYLES };

function hasInteractiveContent(children: ReactNode): boolean {
  return Children.toArray(children).some((child) => {
    if (!isValidElement<{ children?: ReactNode; href?: string }>(child)) return false;
    return (
      child.props.href !== undefined ||
      (typeof child.type === 'string' && ['a', 'button', 'input', 'select', 'textarea'].includes(child.type)) ||
      hasInteractiveContent(child.props.children)
    );
  });
}

export function ArticleHeading({ as: Heading = 'h2', id, children, ...props }: ArticleHeadingProps) {
  const labelId = id ? `heading-label-${id}` : undefined;
  const href = id ? `#${encodeURIComponent(id)}` : undefined;
  const content = <span id={labelId}>{children}</span>;
  const icon = <LinkIcon aria-hidden="true" className={styles.headingLinkIcon} />;

  return (
    <Heading
      {...props}
      id={id}
      tabIndex={id ? -1 : undefined}
      aria-labelledby={labelId}
      className={HEADING_STYLES[Heading]}
    >
      {!href ? (
        children
      ) : hasInteractiveContent(children) ? (
        <>
          {content}
          <a href={href} aria-label="이 제목의 고유 링크" className={styles.headingLink}>
            {icon}
          </a>
        </>
      ) : (
        <a href={href} className={styles.headingLink}>
          {content}
          {icon}
        </a>
      )}
    </Heading>
  );
}

export function ArticleParagraph({ children, ...props }: ElementProps<'p'>) {
  const items = Children.toArray(children).filter((child) => typeof child !== 'string' || child.trim() !== '');
  const onlyChild = items[0];

  if (
    items.length === 1 &&
    isValidElement<ComponentPropsWithoutRef<'img'>>(onlyChild) &&
    onlyChild.type === ArticleMarkdownImage
  ) {
    const { src, alt = '', title, width, height } = onlyChild.props;
    if (typeof src === 'string' && src) {
      return <ArticleImage src={src} alt={alt} title={title} width={width} height={height} />;
    }
  }

  return <p {...props}>{children}</p>;
}

export function ArticleLink({ children, target, rel, ...props }: ElementProps<'a'>) {
  const relationship =
    target === '_blank' ? [...new Set([...(rel?.split(/\s+/) ?? []), 'noopener', 'noreferrer'])].join(' ') : rel;
  return (
    <a
      {...props}
      target={target}
      rel={relationship}
      className={`${styles.link} text-ink underline focus-visible:outline-2 focus-visible:outline-ring`}
    >
      {children}
    </a>
  );
}

export type ArticleQuoteProps = ElementProps<'blockquote'> & {
  source?: { label: string; href?: string };
};

export function ArticleQuote({ source, children, ...props }: ArticleQuoteProps) {
  const quote = (
    <blockquote {...props} className={`${styles.quote} text-body-1 text-ink`}>
      <span aria-hidden="true" className={`${styles.quoteMark} ${styles.quoteOpen} text-heading-1`}>
        “
      </span>
      <div data-article-quote-body>{children}</div>
      <span aria-hidden="true" className={`${styles.quoteMark} ${styles.quoteClose} text-heading-1`}>
        ”
      </span>
    </blockquote>
  );
  if (!source) return quote;
  return (
    <figure className="space-y-12px">
      {quote}
      <figcaption className="px-32px text-right text-body-3 text-ink-secondary desktop:px-48px">
        <cite className="not-italic">
          {source.href ? <ArticleLink href={source.href}>{source.label}</ArticleLink> : source.label}
        </cite>
      </figcaption>
    </figure>
  );
}

export function ArticleUnorderedList({ className, ...props }: ComponentPropsWithoutRef<'ul'>) {
  const taskList = className?.split(/\s+/).includes('contains-task-list');
  return (
    <ul {...props} className={`${styles.list} ${taskList ? 'contains-task-list' : ''} list-disc space-y-8px pl-24px`} />
  );
}

export function ArticleOrderedList(props: ElementProps<'ol'>) {
  return <ol {...props} className="list-decimal space-y-8px pl-24px" />;
}

export function ArticleListItem(props: ElementProps<'li'>) {
  return <li {...props} />;
}

export function ArticleTaskCheckbox({ checked, ...props }: ElementProps<'input'>) {
  return (
    <input
      {...props}
      type="checkbox"
      checked={checked ?? false}
      disabled
      readOnly
      className="mr-8px accent-action-primary-bg"
    />
  );
}

export function ArticleStrong(props: ElementProps<'strong'>) {
  return <strong {...props} className="font-semibold" />;
}

export function ArticleEmphasis(props: ElementProps<'em'>) {
  return <em {...props} className="italic" />;
}

export function ArticleDeleted(props: ElementProps<'del'>) {
  return <del {...props} className="line-through" />;
}

export function ArticleCode({ className, ...props }: ComponentPropsWithoutRef<'code'>) {
  const language = className?.split(/\s+/).find((name) => /^language-[\w-]+$/.test(name));
  return <code {...props} className={`font-mono ${language ?? ''}`} />;
}

export type ArticleTableProps = ElementProps<'table'> & { label?: string };

export function ArticleTable({ label = '표', ...props }: ArticleTableProps) {
  return (
    <section
      aria-label={label}
      // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- 긴 표의 가로 스크롤 영역을 키보드로 탐색한다.
      tabIndex={0}
      className="min-w-0 overflow-x-auto rounded-12 border border-border bg-bg-surface focus-visible:outline-2 focus-visible:outline-ring"
    >
      <table {...props} className={`${styles.table} w-full border-separate border-spacing-0 text-body-3`} />
    </section>
  );
}

export function ArticleTableHead(props: ElementProps<'thead'>) {
  return <thead {...props} className="bg-bg-canvas text-ink-secondary" />;
}
export function ArticleTableBody(props: ElementProps<'tbody'>) {
  return <tbody {...props} className="text-ink" />;
}
export function ArticleTableRow(props: ElementProps<'tr'>) {
  return <tr {...props} />;
}

function alignmentClass(alignment?: string): string {
  switch (alignment) {
    case 'center':
      return 'text-center';
    case 'right':
      return 'text-right';
    case 'justify':
      return 'text-justify';
    default:
      return 'text-left';
  }
}

// MDX가 GFM의 열 정렬을 style.textAlign으로 전달한다. 정렬만 읽고 임의의 스타일은 전달하지 않는다.
export function ArticleTableHeader({
  align,
  style,
  scope = 'col',
  ...props
}: Omit<ComponentPropsWithoutRef<'th'>, 'className' | 'dangerouslySetInnerHTML'>) {
  return (
    <th
      {...props}
      scope={scope}
      className={`px-16px py-12px align-middle text-body-3 font-medium desktop:px-24px desktop:py-16px ${alignmentClass(align ?? style?.textAlign)}`}
    />
  );
}

export function ArticleTableCell({
  align,
  style,
  ...props
}: Omit<ComponentPropsWithoutRef<'td'>, 'className' | 'dangerouslySetInnerHTML'>) {
  return (
    <td
      {...props}
      className={`px-16px py-12px align-top desktop:px-24px desktop:py-16px ${alignmentClass(align ?? style?.textAlign)}`}
    />
  );
}

export function ArticleDivider(props: ElementProps<'hr'>) {
  return <hr {...props} className="border-border" />;
}
export function ArticleBreak(props: ElementProps<'br'>) {
  return <br {...props} />;
}
export function ArticleFootnote(props: ElementProps<'sup'>) {
  return <sup {...props} />;
}
export function ArticleSection(props: ElementProps<'section'>) {
  return <section {...props} />;
}
