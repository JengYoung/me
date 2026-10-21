'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import styles from './article.module.css';

export function ArticleBody({ children }: { children?: ReactNode }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const headings = Array.from(body.querySelectorAll<HTMLElement>('[data-article-prose] :is(h2,h3,h4,h5,h6)[id]'));
    const links = Array.from(body.querySelectorAll<HTMLAnchorElement>('[data-article-toc] a[href^="#"]'));
    let frame = 0;
    function update() {
      frame = 0;
      let current = headings[0];
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= parseFloat(getComputedStyle(heading).scrollMarginTop) + 1)
          current = heading;
      }
      for (const link of links) {
        if (link.hash === `#${encodeURIComponent(current?.id ?? '')}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    function restoreFragment() {
      let id: string;
      try {
        id = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        return;
      }
      const target = document.getElementById(id);
      if (target && body?.contains(target)) {
        target.scrollIntoView({ block: 'start' });
        target.focus({ preventScroll: true });
      }
      schedule();
    }
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('hashchange', restoreFragment);
    restoreFragment();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('hashchange', restoreFragment);
      for (const link of links) link.removeAttribute('aria-current');
    };
  }, [children]);
  return (
    <div ref={bodyRef} className={styles.layout}>
      {children}
    </div>
  );
}
