export interface SeriesDefinition {
  id: string;
  title: string;
  description: string;
  /** docs/series 기준의 상대 이미지 경로. */
  thumbnail?: string;
}

export interface SeriesPost {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
  publishedAt: string;
  series?: { id: string; order: number };
  isDraft?: true;
}

export interface Series extends Omit<SeriesDefinition, 'thumbnail'> {
  thumbnail?: { src: string; width: number; height: number };
  posts: readonly SeriesPost[];
  postCount: number;
  updatedAt: string | null;
  hasDrafts?: true;
}

export interface SeriesRecord extends SeriesDefinition {
  derived: {
    posts: { id: string; order: number }[];
    postCount: number;
    updatedAt: string | null;
  };
}

export function seriesPath(id: string) {
  return `/series/${encodeURIComponent(id)}`;
}

/** 미입력 제목은 로컬 미리보기에서 ID로 식별한다. JSON의 빈 입력은 바꾸지 않는다. */
export function seriesTitle(series: Pick<SeriesDefinition, 'id' | 'title'>) {
  return series.title.trim() || series.id;
}

const time = (value: string | null) => (value ? Date.parse(value) || 0 : 0);

/** 정렬값과 독자에게 표시하는 챕터 번호는 분리한다. 본문·이력은 받지 않는다. */
export function collectSeries(definitions: readonly SeriesDefinition[], posts: readonly SeriesPost[]): Series[] {
  const groups = new Map<string, SeriesPost[]>();
  for (const post of posts) {
    if (!post.series) continue;
    const group = groups.get(post.series.id) ?? [];
    if (group.some((item) => item.id === post.id)) throw new Error(`중복 포스트: ${post.id}`);
    if (group.some((item) => item.series!.order === post.series!.order)) {
      throw new Error(`시리즈 ${post.series.id}: order ${post.series.order} 중복 (${post.id})`);
    }
    // 전달된 객체에 본문·버전 로더 등이 있더라도 목록에는 지정한 메타데이터만 남긴다.
    group.push({
      id: post.id,
      title: post.title,
      summary: post.summary,
      createdAt: post.createdAt,
      publishedAt: post.publishedAt,
      series: { ...post.series },
      ...(post.isDraft ? { isDraft: true } : {}),
    });
    groups.set(post.series.id, group);
  }
  const ids = new Set(definitions.map((item) => item.id));
  for (const id of groups.keys()) if (!ids.has(id)) throw new Error(`시리즈 정의가 없습니다: ${id}`);
  const result = definitions.flatMap(({ id, title, description }): Series[] => {
    const members = groups.get(id);
    if (!members?.length) return [];
    // oxlint-disable-next-line unicorn/no-array-sort -- 수집기가 소유한 새 배열이다.
    members.sort((a, b) => a.series!.order - b.series!.order);
    const updatedAt = members.reduce<string | null>(
      (latest, post) => (time(post.publishedAt) > time(latest) ? post.publishedAt : latest),
      null,
    );
    return [
      {
        id,
        title,
        description,
        posts: members,
        postCount: members.length,
        updatedAt,
        ...(members.some((post) => post.isDraft) ? { hasDrafts: true as const } : {}),
      },
    ];
  });
  // oxlint-disable-next-line unicorn/no-array-sort -- 이 함수에서 만든 결과만 정렬한다.
  return result.sort((a, b) => time(b.updatedAt) - time(a.updatedAt) || a.id.localeCompare(b.id, 'en'));
}

export function recentSeriesPosts(series: Series) {
  // oxlint-disable-next-line unicorn/no-array-sort -- 원본 정렬을 보존한 복사본이다.
  return [...series.posts]
    .sort(
      (a, b) =>
        time(b.createdAt) - time(a.createdAt) || b.series!.order - a.series!.order || a.id.localeCompare(b.id, 'en'),
    )
    .slice(0, 3);
}
