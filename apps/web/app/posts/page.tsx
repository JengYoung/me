import { PostsPage } from '../../screens/posts';
import { parsePageNumber } from '../../shared/lib/pagination';
import { pageMetadata } from '../../shared/lib/seo';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  const page = parsePageNumber((await searchParams).page);
  return pageMetadata({
    title: `Posts — ${page}페이지`,
    description: `문제에 대한 고민, 그리고 해결하는 과정들에 대한 기록들 중 ${page}페이지입니다.`,
    pathname: '/posts',
  });
}
export default PostsPage;
