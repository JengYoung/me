export const HTTP_STATUS = {
  _100_CONTINUE: 100,
  _101_SWITCHING_PROTOCOLS: 101,
  _102_PROCESSING: 102,
  _103_EARLY_HINTS: 103,
  _200_OK: 200,
  _201_CREATED: 201,
  _202_ACCEPTED: 202,
  _203_NON_AUTHORITATIVE_INFORMATION: 203,
  _204_NO_CONTENT: 204,
  _205_RESET_CONTENT: 205,
  _206_PARTIAL_CONTENT: 206,
  _207_MULTI_STATUS: 207,
  _208_ALREADY_REPORTED: 208,
  _226_IM_USED: 226,
  _300_MULTIPLE_CHOICES: 300,
  _301_MOVED_PERMANENTLY: 301,
  _302_FOUND: 302,
  _303_SEE_OTHER: 303,
  _304_NOT_MODIFIED: 304,
  _305_USE_PROXY: 305,
  _307_TEMPORARY_REDIRECT: 307,
  _308_PERMANENT_REDIRECT: 308,
  _400_BAD_REQUEST: 400,
  _401_UNAUTHORIZED: 401,
  _402_PAYMENT_REQUIRED: 402,
  _403_FORBIDDEN: 403,
  _404_NOT_FOUND: 404,
  _405_METHOD_NOT_ALLOWED: 405,
  _406_NOT_ACCEPTABLE: 406,
  _407_PROXY_AUTHENTICATION_REQUIRED: 407,
  _408_REQUEST_TIMEOUT: 408,
  _409_CONFLICT: 409,
  _410_GONE: 410,
  _411_LENGTH_REQUIRED: 411,
  _412_PRECONDITION_FAILED: 412,
  _413_PAYLOAD_TOO_LARGE: 413,
  _414_URI_TOO_LONG: 414,
  _415_UNSUPPORTED_MEDIA_TYPE: 415,
  _416_RANGE_NOT_SATISFIABLE: 416,
  _417_EXPECTATION_FAILED: 417,
  _418_IM_A_TEAPOT: 418,
  _421_MISDIRECTED_REQUEST: 421,
  _422_UNPROCESSABLE_CONTENT: 422,
  _423_LOCKED: 423,
  _424_FAILED_DEPENDENCY: 424,
  _425_TOO_EARLY: 425,
  _426_UPGRADE_REQUIRED: 426,
  _428_PRECONDITION_REQUIRED: 428,
  _429_TOO_MANY_REQUESTS: 429,
  _431_REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  _451_UNAVAILABLE_FOR_LEGAL_REASONS: 451,
  _500_INTERNAL_SERVER_ERROR: 500,
  _501_NOT_IMPLEMENTED: 501,
  _502_BAD_GATEWAY: 502,
  _503_SERVICE_UNAVAILABLE: 503,
  _504_GATEWAY_TIMEOUT: 504,
  _505_HTTP_VERSION_NOT_SUPPORTED: 505,
  _506_VARIANT_ALSO_NEGOTIATES: 506,
  _507_INSUFFICIENT_STORAGE: 507,
  _508_LOOP_DETECTED: 508,
  _510_NOT_EXTENDED: 510,
  _511_NETWORK_AUTHENTICATION_REQUIRED: 511,
} as const;

export type KnownHttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

export type HttpStatusGroup = "informational" | "success" | "redirection" | "client-error" | "server-error";

export const HTTP_STATUS_TEXT: Record<KnownHttpStatusCode, string> = {
  [HTTP_STATUS._100_CONTINUE]: "Continue",
  [HTTP_STATUS._101_SWITCHING_PROTOCOLS]: "Switching Protocols",
  [HTTP_STATUS._102_PROCESSING]: "Processing",
  [HTTP_STATUS._103_EARLY_HINTS]: "Early Hints",
  [HTTP_STATUS._200_OK]: "OK",
  [HTTP_STATUS._201_CREATED]: "Created",
  [HTTP_STATUS._202_ACCEPTED]: "Accepted",
  [HTTP_STATUS._203_NON_AUTHORITATIVE_INFORMATION]: "Non-Authoritative Information",
  [HTTP_STATUS._204_NO_CONTENT]: "No Content",
  [HTTP_STATUS._205_RESET_CONTENT]: "Reset Content",
  [HTTP_STATUS._206_PARTIAL_CONTENT]: "Partial Content",
  [HTTP_STATUS._207_MULTI_STATUS]: "Multi-Status",
  [HTTP_STATUS._208_ALREADY_REPORTED]: "Already Reported",
  [HTTP_STATUS._226_IM_USED]: "IM Used",
  [HTTP_STATUS._300_MULTIPLE_CHOICES]: "Multiple Choices",
  [HTTP_STATUS._301_MOVED_PERMANENTLY]: "Moved Permanently",
  [HTTP_STATUS._302_FOUND]: "Found",
  [HTTP_STATUS._303_SEE_OTHER]: "See Other",
  [HTTP_STATUS._304_NOT_MODIFIED]: "Not Modified",
  [HTTP_STATUS._305_USE_PROXY]: "Use Proxy",
  [HTTP_STATUS._307_TEMPORARY_REDIRECT]: "Temporary Redirect",
  [HTTP_STATUS._308_PERMANENT_REDIRECT]: "Permanent Redirect",
  [HTTP_STATUS._400_BAD_REQUEST]: "Bad Request",
  [HTTP_STATUS._401_UNAUTHORIZED]: "Unauthorized",
  [HTTP_STATUS._402_PAYMENT_REQUIRED]: "Payment Required",
  [HTTP_STATUS._403_FORBIDDEN]: "Forbidden",
  [HTTP_STATUS._404_NOT_FOUND]: "Not Found",
  [HTTP_STATUS._405_METHOD_NOT_ALLOWED]: "Method Not Allowed",
  [HTTP_STATUS._406_NOT_ACCEPTABLE]: "Not Acceptable",
  [HTTP_STATUS._407_PROXY_AUTHENTICATION_REQUIRED]: "Proxy Authentication Required",
  [HTTP_STATUS._408_REQUEST_TIMEOUT]: "Request Timeout",
  [HTTP_STATUS._409_CONFLICT]: "Conflict",
  [HTTP_STATUS._410_GONE]: "Gone",
  [HTTP_STATUS._411_LENGTH_REQUIRED]: "Length Required",
  [HTTP_STATUS._412_PRECONDITION_FAILED]: "Precondition Failed",
  [HTTP_STATUS._413_PAYLOAD_TOO_LARGE]: "Payload Too Large",
  [HTTP_STATUS._414_URI_TOO_LONG]: "URI Too Long",
  [HTTP_STATUS._415_UNSUPPORTED_MEDIA_TYPE]: "Unsupported Media Type",
  [HTTP_STATUS._416_RANGE_NOT_SATISFIABLE]: "Range Not Satisfiable",
  [HTTP_STATUS._417_EXPECTATION_FAILED]: "Expectation Failed",
  [HTTP_STATUS._418_IM_A_TEAPOT]: "I'm a Teapot",
  [HTTP_STATUS._421_MISDIRECTED_REQUEST]: "Misdirected Request",
  [HTTP_STATUS._422_UNPROCESSABLE_CONTENT]: "Unprocessable Content",
  [HTTP_STATUS._423_LOCKED]: "Locked",
  [HTTP_STATUS._424_FAILED_DEPENDENCY]: "Failed Dependency",
  [HTTP_STATUS._425_TOO_EARLY]: "Too Early",
  [HTTP_STATUS._426_UPGRADE_REQUIRED]: "Upgrade Required",
  [HTTP_STATUS._428_PRECONDITION_REQUIRED]: "Precondition Required",
  [HTTP_STATUS._429_TOO_MANY_REQUESTS]: "Too Many Requests",
  [HTTP_STATUS._431_REQUEST_HEADER_FIELDS_TOO_LARGE]: "Request Header Fields Too Large",
  [HTTP_STATUS._451_UNAVAILABLE_FOR_LEGAL_REASONS]: "Unavailable For Legal Reasons",
  [HTTP_STATUS._500_INTERNAL_SERVER_ERROR]: "Internal Server Error",
  [HTTP_STATUS._501_NOT_IMPLEMENTED]: "Not Implemented",
  [HTTP_STATUS._502_BAD_GATEWAY]: "Bad Gateway",
  [HTTP_STATUS._503_SERVICE_UNAVAILABLE]: "Service Unavailable",
  [HTTP_STATUS._504_GATEWAY_TIMEOUT]: "Gateway Timeout",
  [HTTP_STATUS._505_HTTP_VERSION_NOT_SUPPORTED]: "HTTP Version Not Supported",
  [HTTP_STATUS._506_VARIANT_ALSO_NEGOTIATES]: "Variant Also Negotiates",
  [HTTP_STATUS._507_INSUFFICIENT_STORAGE]: "Insufficient Storage",
  [HTTP_STATUS._508_LOOP_DETECTED]: "Loop Detected",
  [HTTP_STATUS._510_NOT_EXTENDED]: "Not Extended",
  [HTTP_STATUS._511_NETWORK_AUTHENTICATION_REQUIRED]: "Network Authentication Required",
};

const KNOWN_HTTP_STATUS_CODE_SET = new Set<number>(Object.values(HTTP_STATUS));

const isStatusInRange = (statusCode: number, min: number, max: number): boolean => {
  return Number.isInteger(statusCode) && statusCode >= min && statusCode <= max;
};

export const isHttpStatusCode = (statusCode: number): boolean => {
  return isStatusInRange(statusCode, 100, 599);
};

export const isKnownHttpStatusCode = (statusCode: number): statusCode is KnownHttpStatusCode => {
  return KNOWN_HTTP_STATUS_CODE_SET.has(statusCode);
};

export const getHttpStatusGroup = (statusCode: number): HttpStatusGroup | undefined => {
  if (isStatusInRange(statusCode, 100, 199)) {
    return "informational";
  }

  if (isStatusInRange(statusCode, 200, 299)) {
    return "success";
  }

  if (isStatusInRange(statusCode, 300, 399)) {
    return "redirection";
  }

  if (isStatusInRange(statusCode, 400, 499)) {
    return "client-error";
  }

  if (isStatusInRange(statusCode, 500, 599)) {
    return "server-error";
  }

  return undefined;
};

export const isInformationalStatus = (statusCode: number): boolean => {
  return getHttpStatusGroup(statusCode) === "informational";
};

export const isSuccessStatus = (statusCode: number): boolean => {
  return getHttpStatusGroup(statusCode) === "success";
};

export const isRedirectionStatus = (statusCode: number): boolean => {
  return getHttpStatusGroup(statusCode) === "redirection";
};

export const isClientErrorStatus = (statusCode: number): boolean => {
  return getHttpStatusGroup(statusCode) === "client-error";
};

export const isServerErrorStatus = (statusCode: number): boolean => {
  return getHttpStatusGroup(statusCode) === "server-error";
};
