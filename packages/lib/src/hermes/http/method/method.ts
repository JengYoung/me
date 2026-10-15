export const HTTP_METHOD = {
  CONNECT: "CONNECT",
  DELETE: "DELETE",
  GET: "GET",
  HEAD: "HEAD",
  OPTIONS: "OPTIONS",
  PATCH: "PATCH",
  POST: "POST",
  PUT: "PUT",
  TRACE: "TRACE",
} as const;

export type HttpMethod = (typeof HTTP_METHOD)[keyof typeof HTTP_METHOD];

const HTTP_METHOD_SET = new Set<string>(Object.values(HTTP_METHOD));

export const isHttpMethod = (method: string): method is HttpMethod => {
  return HTTP_METHOD_SET.has(method);
};

export const normalizeHttpMethod = (method: string): HttpMethod | undefined => {
  const normalizedMethod = method.trim().toUpperCase();

  return isHttpMethod(normalizedMethod) ? normalizedMethod : undefined;
};
