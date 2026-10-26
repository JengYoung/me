import type { ReactNode } from 'react';

const TONES = {
  info: { label: '🎯 참고', className: 'bg-status-info-bg' },
  warning: { label: '⚠️ 주의', className: 'bg-status-warning-bg' },
  success: { label: '💡 팁', className: 'bg-status-success-bg' },
  error: { label: '🚨 오류', className: 'bg-status-error-bg' },
} as const;

export type ArticleCalloutProps = { tone?: keyof typeof TONES; title?: string; children: ReactNode };

export function ArticleCallout({ tone = 'info', title, children }: ArticleCalloutProps) {
  const appearance = TONES[tone] ?? TONES.info;
  const label = title ? `${appearance.label} · ${title}` : appearance.label;
  return (
    <aside aria-label={label} className={`space-y-12px rounded-12 p-20px text-ink ${appearance.className}`}>
      <p className="text-title-4 font-bold">{label}</p>
      <div data-callout-body className="text-body-2">
        {children}
      </div>
    </aside>
  );
}
