import { generatePosts } from './generate-posts.ts';
import { generateDiary } from './generate-diary.ts';

const [posts, diary] = await Promise.all([generatePosts(), generateDiary()]);
console.log({ posts, diary });
