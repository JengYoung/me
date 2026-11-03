export const SITE_NAME = 'JengYoung';
export const SITE_DEFAULT_TITLE = `Blog | ${SITE_NAME}`;

/** 메타데이터를 생성하는 서버에서만 읽는 대표 사이트 주소입니다. */
export function getSiteOrigin(): string {
  const value = process.env.SITE_ORIGIN?.trim();
  if (!value) throw new Error('SITE_ORIGIN 환경변수가 필요합니다.');

  const url = URL.parse(value);
  if (
    !url ||
    (url.protocol !== 'https:' && url.protocol !== 'http:') ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error('SITE_ORIGIN은 경로·쿼리·해시·인증 정보가 없는 http(s) 사이트 주소여야 합니다.');
  }
  return url.origin;
}
