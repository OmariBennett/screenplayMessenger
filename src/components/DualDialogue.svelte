<script lang="ts">
  import Character from './Character.svelte';
  import Parenthetical from './Parenthetical.svelte';
  import Dialogue from './Dialogue.svelte';
  import type { DualDialogueSpeaker } from '../data/screenplayTypes';

  let { left, right }: { left: DualDialogueSpeaker; right: DualDialogueSpeaker } = $props();
</script>

<div class="dual-dialogue">
  <div>
    <Character name={left.name} extension={left.extension} />
    {#if left.parenthetical}<Parenthetical text={left.parenthetical} />{/if}
    <Dialogue text={left.text} />
  </div>
  <div>
    <Character name={right.name} extension={right.extension} />
    {#if right.parenthetical}<Parenthetical text={right.parenthetical} />{/if}
    <Dialogue text={right.text} />
  </div>
</div>
