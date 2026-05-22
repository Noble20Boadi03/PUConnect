/** Display label for service tag pills (People tab style, not all-caps). */
export function formatExploreTagLabel(tag: string): string {
  return tag
    .toLowerCase()
    .split(/\s+/)
    .map((word) => {
      if (word.length <= 3 && /^[a-z]+$/.test(word)) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}
