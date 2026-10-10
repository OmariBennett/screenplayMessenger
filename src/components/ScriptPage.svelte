<script lang="ts">
  import type { Snippet } from 'svelte';

  let { page, children }: { page?: number; children: Snippet } = $props();
</script>

<div class="script-page" data-page={page}>
  {@render children()}
</div>
