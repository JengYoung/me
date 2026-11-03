import { Children, isValidElement } from 'react';
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react';
import { CodeCopyButton } from './code-copy-button';
import styles from './article.module.css';

export type ArticleCodeBlockProps = Omit<ComponentPropsWithoutRef<'pre'>, 'style' | 'dangerouslySetInnerHTML'> & {
  code?: string;
  language?: string;
  /** 빌드 시 Shiki가 만든 테마 색상을 전달한다. */
  style?: Pick<CSSProperties, 'backgroundColor' | 'color'>;
  'data-code'?: string;
  'data-language'?: string;
};

function textContent(node: ReactNode): string {
  return Children.toArray(node)
    .map((child): string => {
      if (typeof child === 'string' || typeof child === 'number') return String(child);
      return isValidElement<{ children?: ReactNode }>(child) ? textContent(child.props.children) : '';
    })
    .join('');
}

export function ArticleCodeBlock({
  code,
  language,
  'data-code': originalCode,
  'data-language': originalLanguage,
  className = '',
  style,
  children,
  ...props
}: ArticleCodeBlockProps) {
  const child = Children.toArray(children)[0];
  const codeClassName = isValidElement<{ className?: string }>(child) ? child.props.className : undefined;
  const label = language ?? originalLanguage ?? codeClassName?.match(/(?:^|\s)language-([^\s]+)/)?.[1] ?? 'text';
  const value = code ?? originalCode ?? textContent(children);

  return (
    <div
      data-theme="dark"
      className="min-w-0 overflow-hidden rounded-12 border border-border bg-bg-surface text-ink scheme-dark"
      style={style?.backgroundColor ? { backgroundColor: style.backgroundColor } : undefined}
    >
      <div className="flex flex-wrap items-center justify-between gap-8px border-b border-border px-16px py-4px">
        <span className="text-body-3 text-ink-secondary">{label}</span>
        <CodeCopyButton code={value} />
      </div>
      <pre
        {...props}
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- 긴 코드의 가로 스크롤 영역을 키보드로 탐색한다.
        tabIndex={0}
        aria-label={`${label} 코드`}
        style={style ? { backgroundColor: style.backgroundColor, color: style.color } : undefined}
        className={`${styles.code} ${className} overflow-x-auto p-16px text-body-2 text-ink focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring`}
      >
        {code !== undefined ? <code className="font-mono">{code}</code> : children}
      </pre>
    </div>
  );
}
