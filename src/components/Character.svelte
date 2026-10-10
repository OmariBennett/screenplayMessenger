<script lang="ts">
  let { name, extension }: { name: string; extension?: string } = $props();
</script>

<p class="character">{name}{#if extension} <span class="extension">({extension})</span>{/if}</p>
