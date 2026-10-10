<script lang="ts">
  let { text, caps = [] }: { text: string; caps?: string[] } = $props();

  // Wrap any emphasis words (important objects/sounds) in the ALL-CAPS
  // .script-caps style, per screenplay convention.
  function withCaps(source: string, words: string[]): string {
    return words.reduce(
      (acc, word) => acc.split(word).join(`<span class="script-caps">${word}</span>`),
      source,
    );
  }
</script>

<p class="action">{@html withCaps(text, caps)}</p>
