import { POST_DETAILS_MOCK } from '../constants/postDetailMock';
import type { PostDetail } from '../types';

export function getPostDetailById(id: string): PostDetail | undefined {
  return POST_DETAILS_MOCK[id];
}
