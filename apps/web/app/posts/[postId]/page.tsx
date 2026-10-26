import { PostPage, getPostMetadata, getPostStaticParams } from '../../../screens/posts';

export const dynamic = 'force-static';
export const generateStaticParams = getPostStaticParams;

export async function generateMetadata({ params }: { params: Promise<{ postId: string }> }) {
  return getPostMetadata((await params).postId);
}

export default async function Post({ params }: { params: Promise<{ postId: string }> }) {
  return <PostPage postId={(await params).postId} />;
}
