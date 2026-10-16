import type { RtlScrollType } from './scroll-area.geometry';

/** Detect per owner document without changing the consumer's viewport or global state. */
export function detectRtlScrollType(document: Document): RtlScrollType {
  const probe = document.createElement('div');
  const child = document.createElement('div');
  probe.dir = 'rtl';
  probe.style.cssText = 'position:absolute;top:-9999px;width:4px;height:1px;overflow:scroll;visibility:hidden';
  child.style.width = '8px';
  probe.append(child);
  document.body.append(probe);
  try {
    if (probe.scrollLeft > 0) return 'default';
    probe.scrollLeft = 1;
    return probe.scrollLeft === 0 ? 'negative' : 'reverse';
  } finally {
    probe.remove();
  }
}
