/** Strips leading @ and lowercases for route lookup. */
export function normalizeUsernameSlug(raw: string): string {
  return raw.replace(/^@/, '').trim().toLowerCase();
}
