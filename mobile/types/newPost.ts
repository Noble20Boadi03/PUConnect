import type { MarketPostTag } from './market';

/** Matches PostPrice kinds used on market cards and detail pages. */
export type NewPostPriceKind = 'fixed' | 'range' | 'negotiated';

export type NewPostType = MarketPostTag;

export interface NewPostSearchParams {
  type?: 'service' | 'request';
}
