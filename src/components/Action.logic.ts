// Logic from Action.svelte as plain TypeScript (the component itself is unchanged).

export interface Props {
  text: string;
  caps?: string[];
}

// Wrap any emphasis words (important objects/sounds) in the ALL-CAPS
// .script-caps style, per screenplay convention. Returns an HTML string.
export function withCaps(source: string, words: string[] = []): string {
  return words.reduce(
    (acc, word) => acc.split(word).join(`<span class="script-caps">${word}</span>`),
    source,
  );
}
