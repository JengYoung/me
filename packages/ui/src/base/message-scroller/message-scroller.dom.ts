import type { MessageScrollPosition } from './message-scroller.machine';

export function messageElements(content: HTMLDivElement) {
  return [...content.querySelectorAll<HTMLDivElement>('[data-scope="message-scroller"][data-part="message"]')].filter(
    (element) => element.closest('[data-scope="message-scroller"][data-part="content"]') === content,
  );
}
export function messageOffset(viewport: HTMLDivElement, message: HTMLDivElement) {
  return message.getBoundingClientRect().top - viewport.getBoundingClientRect().top - viewport.clientTop;
}
export function captureMessagePosition(
  viewport: HTMLDivElement,
  content: HTMLDivElement,
  following: boolean,
): MessageScrollPosition {
  const top = viewport.getBoundingClientRect().top + viewport.clientTop;
  const messages = messageElements(content);
  const visible = messages.find((element) => element.getBoundingClientRect().bottom > top) ?? messages.at(-1);
  return {
    messageId: visible?.dataset.messageId ?? null,
    offset: visible ? messageOffset(viewport, visible) : 0,
    scrollTop: viewport.scrollTop,
    following,
  };
}
export function restoredMessageTop(viewport: HTMLDivElement, content: HTMLDivElement, position: MessageScrollPosition) {
  const message = messageElements(content).find((element) => element.dataset.messageId === position.messageId);
  return message ? viewport.scrollTop + messageOffset(viewport, message) - position.offset : position.scrollTop;
}
