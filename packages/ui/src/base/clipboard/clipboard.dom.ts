import type { ClipboardFailure } from './clipboard.machine';

export async function writeClipboard(value: string): Promise<void> {
  if (typeof navigator === 'undefined' || typeof navigator.clipboard?.writeText !== 'function')
    throw { reason: 'unavailable' } satisfies ClipboardFailure;
  try {
    await navigator.clipboard.writeText(value);
  } catch (cause) {
    throw {
      reason: cause instanceof Error && cause.name === 'NotAllowedError' ? 'denied' : 'failed',
      cause,
    } satisfies ClipboardFailure;
  }
}
