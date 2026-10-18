/** 스크롤 방향에 따라 숨김·노출하며 포커스와 페이지 복원 시 헤더를 보여줍니다. */
export function scrollHeaderPlugin(header: HTMLElement) {
  const document = header.ownerDocument;
  const view = document.defaultView;
  if (!view) return;

  const previousScrolled = header.getAttribute('data-scrolled');
  const previousBorderVisible = header.getAttribute('data-border-visible');
  const previousTransform = header.style.getPropertyValue('transform');
  const previousTransformPriority = header.style.getPropertyPriority('transform');

  let lastScroll = Math.max(0, view.scrollY);
  let translateY = 0;

  const updateAppearance = (scrollY: number) => {
    header.dataset.scrolled = String(scrollY > 0);
    header.dataset.borderVisible = String(scrollY > 0);
  };

  const showHeader = () => {
    lastScroll = Math.max(0, view.scrollY);
    translateY = 0;
    header.style.transform = 'translateY(0px)';
    updateAppearance(lastScroll);
  };

  const onScroll = () => {
    const scrollY = Math.max(0, view.scrollY);
    updateAppearance(scrollY);

    const nextTranslateY =
      scrollY === 0 || header.contains(document.activeElement)
        ? 0
        : Math.max(-header.offsetHeight, Math.min(0, translateY + lastScroll - scrollY));

    if (nextTranslateY !== translateY) {
      translateY = nextTranslateY;
      header.style.transform = `translateY(${translateY}px)`;
    }

    lastScroll = scrollY;
  };

  showHeader();
  view.addEventListener('scroll', onScroll, { passive: true });
  view.addEventListener('pageshow', showHeader);
  header.addEventListener('focusin', showHeader);

  return () => {
    view.removeEventListener('scroll', onScroll);
    view.removeEventListener('pageshow', showHeader);
    header.removeEventListener('focusin', showHeader);
    if (previousTransform) {
      header.style.setProperty('transform', previousTransform, previousTransformPriority);
    } else {
      header.style.removeProperty('transform');
    }
    restoreAttribute(header, 'data-scrolled', previousScrolled);
    restoreAttribute(header, 'data-border-visible', previousBorderVisible);
  };
}

function restoreAttribute(header: HTMLElement, name: string, value: string | null) {
  if (value === null) {
    header.removeAttribute(name);
  } else {
    header.setAttribute(name, value);
  }
}
