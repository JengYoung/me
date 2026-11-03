import type { ComponentType } from 'react';
import type { Post, PostRevision } from '../../../entities/post';

export interface CurrentPost {
  post: Post;
  revisions: PostRevision[];
  Content: ComponentType;
}
