import type { NewPostPriceKind, NewPostType } from '../types/newPost';
import type { PostPrice } from '../types/market';

export function getNewPostDescriptionPlaceholder(postType: NewPostType): string {
  return postType === 'Service'
    ? 'Describe what you offer, your experience, and how peers can book you...'
    : 'Describe what you need help with, timing, and any important details...';
}

export function getPriceSectionTitle(postType: NewPostType): string {
  return postType === 'Service' ? 'Pricing' : 'Budget';
}

export const NEW_POST_PRICE_OPTIONS: { kind: NewPostPriceKind; label: string; hint: string }[] = [
  { kind: 'fixed', label: 'Fixed', hint: 'Single price (e.g. $50)' },
  { kind: 'negotiated', label: 'On request', hint: 'Shown as “On Request” on cards' },
  { kind: 'range', label: 'Range', hint: 'Minimum and maximum (e.g. $20 – $30)' },
];

export interface NewPostFormValidation {
  valid: boolean;
  message?: string;
}

export function validateNewPostForm(input: {
  title: string;
  description: string;
  postType: NewPostType;
  priceKind: NewPostPriceKind;
  fixedAmount: string;
  rangeMin: string;
  rangeMax: string;
  imageUris: string[];
  isProvider: boolean;
  providerTagCount: number;
  helpCategoryIds: string[];
}): NewPostFormValidation {
  if (!input.title.trim()) {
    return { valid: false, message: 'Add a title for your post.' };
  }
  if (!input.description.trim()) {
    return { valid: false, message: 'Add a description so peers know what you need or offer.' };
  }

  if (input.priceKind === 'fixed') {
    const amount = Number(input.fixedAmount);
    if (!input.fixedAmount.trim() || Number.isNaN(amount) || amount <= 0) {
      return { valid: false, message: 'Enter a valid fixed price greater than 0.' };
    }
  }

  if (input.priceKind === 'range') {
    const min = Number(input.rangeMin);
    const max = Number(input.rangeMax);
    if (
      !input.rangeMin.trim() ||
      !input.rangeMax.trim() ||
      Number.isNaN(min) ||
      Number.isNaN(max) ||
      min <= 0 ||
      max <= 0
    ) {
      return { valid: false, message: 'Enter a valid minimum and maximum for your price range.' };
    }
    if (min >= max) {
      return { valid: false, message: 'Maximum must be higher than minimum.' };
    }
  }

  if (input.postType === 'Service' && input.imageUris.length === 0) {
    return { valid: false, message: 'Service posts need at least one image.' };
  }

  if (input.postType === 'Request' && !input.isProvider && input.helpCategoryIds.length === 0) {
    return {
      valid: false,
      message: 'Choose a help category so your request reaches the right peers.',
    };
  }

  return { valid: true };
}

export function buildPostPriceFromForm(input: {
  priceKind: NewPostPriceKind;
  fixedAmount: string;
  rangeMin: string;
  rangeMax: string;
}): PostPrice {
  switch (input.priceKind) {
    case 'fixed':
      return { kind: 'fixed', amount: Number(input.fixedAmount) };
    case 'range':
      return { kind: 'range', min: Number(input.rangeMin), max: Number(input.rangeMax) };
    default:
      return { kind: 'negotiated' };
  }
}
