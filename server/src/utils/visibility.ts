/** Post statuses visible on the public market feed (locked posts stay visible but can't receive new requests). */
export const PUBLIC_POST_STATUSES = ['active', 'locked_by_admin'] as const;

/** User statuses eligible to appear in public provider lists and as post authors. */
export const PUBLIC_USER_STATUSES = ['active'] as const;
