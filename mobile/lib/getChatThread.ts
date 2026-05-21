import { CHAT_TRANSCRIPT_MOCK, DEFAULT_CHAT_TRANSCRIPT } from '../constants/chatMock';
import type { ChatThread } from '../types/chat';
import { formatPostPrice } from './formatPostPrice';
import { getPostDetailById } from './getPostDetailById';
import { getProviderProfileByUsername } from './getProviderProfileByUsername';
import { normalizeUsernameSlug } from './normalizeUsername';

export function getChatThread(
  rawUsername: string,
  postId?: string
): ChatThread | undefined {
  const slug = normalizeUsernameSlug(rawUsername);
  const profile = getProviderProfileByUsername(slug);
  if (!profile) return undefined;

  const post = postId ? getPostDetailById(postId) : undefined;
  const postContext =
    post && postId
      ? {
          postId,
          title: post.title,
          tag: post.tag,
          priceLabel: formatPostPrice(post.price),
        }
      : undefined;

  return {
    providerUsername: slug,
    participant: {
      displayName: profile.displayName,
      handle: profile.handle,
      avatarUrl: profile.avatarUrl,
    },
    postContext,
    dateGroups: CHAT_TRANSCRIPT_MOCK[slug] ?? DEFAULT_CHAT_TRANSCRIPT,
  };
}
