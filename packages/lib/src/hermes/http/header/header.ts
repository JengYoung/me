export const HTTP_HEADER = {
  ACCEPT: "Accept",
  ACCEPT_ENCODING: "Accept-Encoding",
  ACCEPT_LANGUAGE: "Accept-Language",
  ACCESS_CONTROL_ALLOW_ORIGIN: "Access-Control-Allow-Origin",
  AUTHORIZATION: "Authorization",
  CACHE_CONTROL: "Cache-Control",
  CONTENT_ENCODING: "Content-Encoding",
  CONTENT_LENGTH: "Content-Length",
  CONTENT_TYPE: "Content-Type",
  COOKIE: "Cookie",
  ETAG: "ETag",
  HOST: "Host",
  IF_NONE_MATCH: "If-None-Match",
  LOCATION: "Location",
  ORIGIN: "Origin",
  REFERER: "Referer",
  RETRY_AFTER: "Retry-After",
  SET_COOKIE: "Set-Cookie",
  USER_AGENT: "User-Agent",
  WWW_AUTHENTICATE: "WWW-Authenticate",
  X_REQUEST_ID: "X-Request-Id",
  X_REQUESTED_WITH: "X-Requested-With",
} as const;

export type HttpHeader = (typeof HTTP_HEADER)[keyof typeof HTTP_HEADER];

const HTTP_HEADER_NAME_PATTERN = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
const CANONICAL_HTTP_HEADER_BY_LOWERCASE = new Map(
  Object.values(HTTP_HEADER).map((name) => [name.toLowerCase(), name]),
);

export const isHttpHeaderName = (name: string): boolean => {
  return HTTP_HEADER_NAME_PATTERN.test(name);
};

export const normalizeHeaderName = (name: string): string => {
  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    return "";
  }

  const normalizedName = trimmedName
    .split("-")
    .map((segment) => {
      if (segment.length === 0) {
        return segment;
      }

      return `${segment.charAt(0).toUpperCase()}${segment.slice(1).toLowerCase()}`;
    })
    .join("-");

  return CANONICAL_HTTP_HEADER_BY_LOWERCASE.get(normalizedName.toLowerCase()) ?? normalizedName;
};
