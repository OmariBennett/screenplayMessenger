<script lang="ts">
  import type { ScreenplayElement } from '../data/screenplayTypes';
  import SceneHeading from './SceneHeading.svelte';
  import Subheading from './Subheading.svelte';
  import Action from './Action.svelte';
  import Character from './Character.svelte';
  import Parenthetical from './Parenthetical.svelte';
  import Dialogue from './Dialogue.svelte';
  import Transition from './Transition.svelte';
  import DualDialogue from './DualDialogue.svelte';

  let { el }: { el: ScreenplayElement } = $props();
</script>

{#if el.type === 'sceneHeading'}
  <SceneHeading text={el.text} />
{:else if el.type === 'subheading'}
  <Subheading text={el.text} />
{:else if el.type === 'action'}
  <Action text={el.text} caps={el.caps} />
{:else if el.type === 'character'}
  <Character name={el.name} extension={el.extension} />
{:else if el.type === 'parenthetical'}
  <Parenthetical text={el.text} />
{:else if el.type === 'dialogue'}
  <Dialogue text={el.text} />
{:else if el.type === 'transition'}
  <Transition text={el.text} />
{:else if el.type === 'dualDialogue'}
  <DualDialogue left={el.left} right={el.right} />
{/if}
