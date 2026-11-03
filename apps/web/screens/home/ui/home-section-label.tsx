import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import styles from './home-section-label.module.css';

export function HomeSectionLabel({ label, href, linkLabel }: { label: string; href: string; linkLabel: string }) {
  return (
    <div className="flex min-w-0 items-center gap-12px desktop:gap-16px">
      <p className="shrink-0 text-title-3 text-action-primary-bg">{label}</p>
      <span aria-hidden="true" className="min-w-16px flex-1 border-t border-border" />
      <Link
        href={href}
        className={`${styles.link} inline-flex min-h-48px shrink-0 items-center gap-4px whitespace-nowrap rounded-4 text-body-3 text-ink-muted hover:text-action-primary-bg active:text-action-primary-pressed focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring`}
      >
        {linkLabel}
        <ArrowUpRight size={16} className={styles.icon} aria-hidden="true" />
      </Link>
    </div>
  );
}
