import type { Metadata } from 'next';

export const SITE_ORIGIN = 'https://jengyoung.co.kr';

export function absoluteUrl(pathname: string) {
  const url = new URL(pathname, SITE_ORIGIN);
  url.search = '';
  url.hash = '';
  return url.href;
}

export function pageMetadata({
  title,
  description,
  pathname,
}: {
  title: string;
  description: string;
  pathname: string;
}): Metadata {
  const canonical = absoluteUrl(pathname);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, locale: 'ko_KR', type: 'website' },
    twitter: { card: 'summary', title, description },
  };
}
