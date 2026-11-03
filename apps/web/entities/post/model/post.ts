export interface PostMetadata {
  title: string;
  summary: string;
  publishedAt: string;
  tags: string[];
  reason?: string;
  series?: { id: string; order: number };
}

export interface Post extends PostMetadata {
  id: string;
  version: string;
  createdAt: string;
  /** 파일명에서 계산하며, 로컬 미리보기에서만 존재한다. */
  isDraft?: true;
}

export interface PostRevision {
  version: string;
  publishedAt: string;
  reason?: string;
}

const VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

export function isPublicVersion(version: string) {
  return VERSION.test(version) && !version.startsWith('0.');
}

export function compareVersions(left: string, right: string) {
  const a = left.split('.').map(BigInt);
  const b = right.split('.').map(BigInt);
  for (let index = 0; index < 3; index++) {
    if (a[index]! > b[index]!) return 1;
    if (a[index]! < b[index]!) return -1;
  }
  return 0;
}

export function postPath(postId: string) {
  return `/posts/${encodeURIComponent(postId)}`;
}

export function formatPublishedAt(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Asia/Seoul',
  }).format(new Date(value));
}
