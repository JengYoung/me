import { DiaryEntryPage, getDiaryMetadata, getDiaryStaticParams } from '../../../screens/diary';

export const dynamic = 'force-static';
export const generateStaticParams = getDiaryStaticParams;

export async function generateMetadata({ params }: { params: Promise<{ entryId: string }> }) {
  return getDiaryMetadata((await params).entryId);
}

export default async function DiaryEntry({ params }: { params: Promise<{ entryId: string }> }) {
  return <DiaryEntryPage entryId={(await params).entryId} />;
}
