export interface FileUploadTransportOptions {
  signal: AbortSignal;
  onProgress?: (progress: { loaded: number; total?: number }) => void;
}
/** The caller owns cancellation, retry and progress; uploading never mutates selection. */
export type FileUploadTransport = (files: readonly File[], options: FileUploadTransportOptions) => Promise<void>;
export async function uploadFiles(
  files: readonly File[],
  transport: FileUploadTransport,
  options: FileUploadTransportOptions,
) {
  options.signal.throwIfAborted();
  await transport([...files], options);
  options.signal.throwIfAborted();
}
