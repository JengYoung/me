import { HomeSectionLabel } from './home-section-label';

const HEADING = '이런 것들에 관심 가지며 개발하고 있어요';

export function HomeSeriesHeading({ id }: { id: string }) {
  return (
    <div className="space-y-12px">
      <HomeSectionLabel label="Series" href="/series?showType=carousel" linkLabel="시리즈 목록 보러가기" />
      <h2 id={id} aria-label={HEADING} className="text-heading-6 desktop:text-heading-4">
        이런 것들에 관심 가지며
        <br />
        개발하고 있어요
      </h2>
    </div>
  );
}
