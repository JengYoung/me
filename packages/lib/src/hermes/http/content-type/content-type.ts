export const HTTP_CONTENT_TYPE = {
  APPLICATION_FORM_URLENCODED: "application/x-www-form-urlencoded",
  APPLICATION_JAVASCRIPT: "application/javascript",
  APPLICATION_JSON: "application/json",
  APPLICATION_OCTET_STREAM: "application/octet-stream",
  APPLICATION_PDF: "application/pdf",
  APPLICATION_XML: "application/xml",
  IMAGE_SVG_XML: "image/svg+xml",
  MULTIPART_FORM_DATA: "multipart/form-data",
  TEXT_CSS: "text/css",
  TEXT_CSV: "text/csv",
  TEXT_HTML: "text/html",
  TEXT_PLAIN: "text/plain",
  TEXT_XML: "text/xml",
} as const;

export type HttpContentType = (typeof HTTP_CONTENT_TYPE)[keyof typeof HTTP_CONTENT_TYPE];

export type ParsedContentType = {
  type: string;
  subtype: string;
  mimeType: string;
  parameters: Record<string, string>;
};

const HTTP_TOKEN_PATTERN = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;

const splitContentTypeSegments = (contentType: string): string[] => {
  const segments: string[] = [];
  let segment = "";
  let isQuoted = false;
  let isEscaped = false;

  for (const char of contentType) {
    if (isEscaped) {
      segment += char;
      isEscaped = false;
      continue;
    }

    if (char === "\\" && isQuoted) {
      segment += char;
      isEscaped = true;
      continue;
    }

    if (char === '"') {
      segment += char;
      isQuoted = !isQuoted;
      continue;
    }

    if (char === ";" && !isQuoted) {
      segments.push(segment.trim());
      segment = "";
      continue;
    }

    segment += char;
  }

  segments.push(segment.trim());

  return segments;
};

const unquoteParameterValue = (value: string): string => {
  const trimmedValue = value.trim();

  if (trimmedValue.length < 2 || !trimmedValue.startsWith('"') || !trimmedValue.endsWith('"')) {
    return trimmedValue;
  }

  return trimmedValue.slice(1, -1).replace(/\\(["\\])/g, "$1");
};

export const parseContentType = (contentType: string): ParsedContentType | undefined => {
  const [rawMimeType, ...rawParameters] = splitContentTypeSegments(contentType);

  if (rawMimeType === undefined) {
    return undefined;
  }

  const mimeType = rawMimeType.trim().toLowerCase();
  const mimeTypeSegments = mimeType.split("/");

  if (mimeTypeSegments.length !== 2) {
    return undefined;
  }

  const [type, subtype] = mimeTypeSegments;

  if (!HTTP_TOKEN_PATTERN.test(type) || !HTTP_TOKEN_PATTERN.test(subtype)) {
    return undefined;
  }

  const parameters: Record<string, string> = {};

  for (const rawParameter of rawParameters) {
    const separatorIndex = rawParameter.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const parameterName = rawParameter.slice(0, separatorIndex).trim().toLowerCase();

    if (!HTTP_TOKEN_PATTERN.test(parameterName)) {
      continue;
    }

    parameters[parameterName] = unquoteParameterValue(rawParameter.slice(separatorIndex + 1));
  }

  return {
    type,
    subtype,
    mimeType: `${type}/${subtype}`,
    parameters,
  };
};

export const isJsonContentType = (contentType: string): boolean => {
  const parsedContentType = parseContentType(contentType);

  return (
    parsedContentType !== undefined &&
    (parsedContentType.mimeType === HTTP_CONTENT_TYPE.APPLICATION_JSON || parsedContentType.subtype.endsWith("+json"))
  );
};
