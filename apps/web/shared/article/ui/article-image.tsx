import type { ComponentPropsWithoutRef } from 'react';

const PC_WIDTHS = {
  auto: 'desktop:w-fit',
  full: 'desktop:w-full',
  '3/4': 'desktop:w-3/4',
  '2/3': 'desktop:w-2/3',
  '1/2': 'desktop:w-1/2',
} as const;

const MO_WIDTHS = {
  auto: 'mobile:w-fit',
  full: 'mobile:w-full',
  '3/4': 'mobile:w-3/4',
  '2/3': 'mobile:w-2/3',
  '1/2': 'mobile:w-1/2',
} as const;

export type ArticleImageWidth = keyof typeof PC_WIDTHS;

export type ArticleImageProps = Pick<
  ComponentPropsWithoutRef<'img'>,
  'title' | 'width' | 'height' | 'loading' | 'decoding'
> & {
  src: string;
  alt: string;
  caption?: string;
  pcWidth?: ArticleImageWidth;
  moWidth?: ArticleImageWidth;
  inline?: boolean;
};

export function ArticleImage({
  src,
  alt,
  title,
  caption = title,
  pcWidth = 'auto',
  moWidth = 'auto',
  inline = false,
  loading = 'lazy',
  decoding = 'async',
  width,
  height,
}: ArticleImageProps) {
  const picture = (
    // oxlint-disable-next-line nextjs/no-img-element -- 콘텐츠 로더가 해석한 자산 URL을 사용한다. 원본 치수는 선택적으로 전달받으며 Next Image의 임의 치수를 만들지 않는다.
    <img
      src={src}
      alt={alt}
      title={title}
      width={width}
      height={height}
      loading={loading}
      decoding={decoding}
      className="block h-auto w-full max-w-full rounded-8"
    />
  );
  const size = `max-w-full ${PC_WIDTHS[pcWidth]} ${MO_WIDTHS[moWidth]}`;

  if (inline) {
    return (
      <span data-article-image className={`inline-block align-middle ${size}`}>
        {picture}
      </span>
    );
  }

  return (
    <figure data-article-image className={`mx-auto space-y-8px ${size}`}>
      {picture}
      {caption && <figcaption className="text-body-3 text-ink-secondary">{caption}</figcaption>}
    </figure>
  );
}

/** 문장 안에서는 phrasing content를 유지하고, 단독 이미지는 ArticleParagraph가 figure로 승격한다. */
export function ArticleMarkdownImage({ src, alt = '', ...props }: ComponentPropsWithoutRef<'img'>) {
  if (!src || typeof src !== 'string') return null;
  return <ArticleImage {...props} src={src} alt={alt} inline />;
}
