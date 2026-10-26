import type { Metadata } from 'next';
import { SITE_NAME, SITE_ORIGIN } from '../../config';

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
  const fullTitle = `${title} | ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title: fullTitle, description, url: canonical, locale: 'ko_KR', type: 'website' },
    twitter: { card: 'summary', title: fullTitle, description },
  };
}
