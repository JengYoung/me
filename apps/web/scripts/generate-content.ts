import { generatePosts } from './generate-posts.ts';
import { generateDiary } from './generate-diary.ts';
import { generateSeries } from './generate-series.ts';

const [posts, diary, series] = await Promise.all([generatePosts(), generateDiary(), generateSeries()]);
console.log({ posts, diary, series });
