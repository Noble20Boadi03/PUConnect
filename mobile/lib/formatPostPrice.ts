import type { PostPrice } from '../types';

/**
 * Formats post pricing for display on all market cards.
 * Fixed: $50 · Range: $20 - $30 · Negotiated: On Request
 */
export function formatPostPrice(price: PostPrice): string {
  switch (price.kind) {
    case 'fixed':
      return `$${price.amount}`;
    case 'range':
      return `$${price.min} - $${price.max}`;
    case 'negotiated':
      return 'On Request';
  }
}
