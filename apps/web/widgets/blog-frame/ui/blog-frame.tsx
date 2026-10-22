import type { ReactNode } from 'react';
import { BlogHeader } from './blog-header';

export function BlogFrame({ children }: { children: ReactNode }) {
  return (
    <>
      <BlogHeader />
      <div className="pt-64px">{children}</div>
    </>
  );
}
