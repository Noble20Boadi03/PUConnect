import { OWNER_POST_ID_PREFIX } from '../constants/profilePostsMock';
import { POST_DETAILS_MOCK } from '../constants/postDetailMock';
import type { PostDetail, User } from '../types';

const avatar = (seed: string) => `https://i.pravatar.cc/256?u=${seed}`;

function personalizeOwnerPostDetail(detail: PostDetail, user: User): PostDetail {
  const name = user.name?.trim() || detail.author.fullName;
  const username = user.username ? `@${user.username}` : detail.author.username;
  return {
    ...detail,
    author: {
      ...detail.author,
      fullName: name,
      username,
      avatarUrl: user.avatarUrl ?? avatar(user.username ?? 'owner'),
    },
  };
}

export function getPostDetailById(id: string, user?: User | null): PostDetail | undefined {
  const detail = POST_DETAILS_MOCK[id];
  if (!detail) return undefined;
  if (id.startsWith(OWNER_POST_ID_PREFIX) && user) {
    return personalizeOwnerPostDetail(detail, user);
  }
  return detail;
}
