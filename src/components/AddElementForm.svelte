<script lang="ts">
  import { untrack } from 'svelte';
  import type { ScreenplayElement, ScreenplayPage } from '../data/screenplayTypes';

  let {
    pages,
    onAdd
  }: {
    pages: ScreenplayPage[];
    onAdd: (target: { pageNumber: number; asNewPage: boolean }, element: ScreenplayElement) => void;
  } = $props();

  const ELEMENT_TYPES = [
    { value: 'sceneHeading', label: 'Scene Heading' },
    { value: 'subheading', label: 'Subheading' },
    { value: 'action', label: 'Action' },
    { value: 'character', label: 'Character' },
    { value: 'parenthetical', label: 'Parenthetical' },
    { value: 'dialogue', label: 'Dialogue' },
    { value: 'transition', label: 'Transition' },
    { value: 'dualDialogue', label: 'Dual Dialogue' }
  ] as const;

  let type = $state<ScreenplayElement['type']>('action');
  let text = $state('');
  let caps = $state('');
  let name = $state('');
  let extension = $state('');
  let leftName = $state('');
  let leftExtension = $state('');
  let leftParenthetical = $state('');
  let leftText = $state('');
  let rightName = $state('');
  let rightExtension = $state('');
  let rightParenthetical = $state('');
  let rightText = $state('');

  let destination = $state<'existing' | 'new'>('existing');
  let targetPage = $state(untrack(() => pages.at(-1)?.page ?? 1));
  let error = $state('');

  function resetFields() {
    text = '';
    caps = '';
    name = '';
    extension = '';
    leftName = '';
    leftExtension = '';
    leftParenthetical = '';
    leftText = '';
    rightName = '';
    rightExtension = '';
    rightParenthetical = '';
    rightText = '';
  }

  function buildElement(): ScreenplayElement | null {
    switch (type) {
      case 'sceneHeading':
      case 'subheading':
      case 'parenthetical':
      case 'dialogue':
      case 'transition':
        return text.trim() ? { type, text: text.trim() } : null;
      case 'action': {
        if (!text.trim()) return null;
        const capsList = caps.split(',').map((s) => s.trim()).filter(Boolean);
        return { type, text: text.trim(), ...(capsList.length ? { caps: capsList } : {}) };
      }
      case 'character':
        return name.trim()
          ? { type, name: name.trim(), ...(extension.trim() ? { extension: extension.trim() } : {}) }
          : null;
      case 'dualDialogue':
        if (!leftName.trim() || !leftText.trim() || !rightName.trim() || !rightText.trim()) return null;
        return {
          type,
          left: {
            name: leftName.trim(),
            text: leftText.trim(),
            ...(leftExtension.trim() ? { extension: leftExtension.trim() } : {}),
            ...(leftParenthetical.trim() ? { parenthetical: leftParenthetical.trim() } : {})
          },
          right: {
            name: rightName.trim(),
            text: rightText.trim(),
            ...(rightExtension.trim() ? { extension: rightExtension.trim() } : {}),
            ...(rightParenthetical.trim() ? { parenthetical: rightParenthetical.trim() } : {})
          }
        };
      default:
        return null;
    }
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const element = buildElement();
    if (!element) {
      error = 'Fill in the required fields for this element type.';
      return;
    }
    error = '';
    onAdd({ pageNumber: targetPage, asNewPage: destination === 'new' }, element);
    resetFields();
  }
</script>

<form class="add-element-form" onsubmit={handleSubmit}>
  <h2>Add to screenplay</h2>

  <label>
    Element type
    <select bind:value={type}>
      {#each ELEMENT_TYPES as opt (opt.value)}
        <option value={opt.value}>{opt.label}</option>
      {/each}
    </select>
  </label>

  <label>
    Add to
    <select bind:value={destination}>
      <option value="existing">Existing page</option>
      <option value="new">New page (after last)</option>
    </select>
  </label>

  {#if destination === 'existing'}
    <label>
      Page
      <select bind:value={targetPage}>
        {#each pages as p (p.page)}
          <option value={p.page}>Page {p.page}</option>
        {/each}
      </select>
    </label>
  {/if}

  {#if type === 'sceneHeading' || type === 'subheading' || type === 'parenthetical' || type === 'dialogue' || type === 'transition'}
    <label>
      Text
      <input type="text" bind:value={text} placeholder="e.g. INT. KITCHEN – DAY" />
    </label>
  {/if}

  {#if type === 'action'}
    <label>
      Text
      <textarea bind:value={text} rows="3" placeholder="Describe the action..."></textarea>
    </label>
    <label>
      Emphasis words (comma-separated, optional)
      <input type="text" bind:value={caps} placeholder="e.g. RAIN, CRASH" />
    </label>
  {/if}

  {#if type === 'character'}
    <label>
      Name
      <input type="text" bind:value={name} placeholder="e.g. JANE" />
    </label>
    <label>
      Extension (optional)
      <input type="text" bind:value={extension} placeholder="e.g. V.O." />
    </label>
  {/if}

  {#if type === 'dualDialogue'}
    <fieldset>
      <legend>Left speaker</legend>
      <label>Name <input type="text" bind:value={leftName} /></label>
      <label>Extension (optional) <input type="text" bind:value={leftExtension} /></label>
      <label>Parenthetical (optional) <input type="text" bind:value={leftParenthetical} /></label>
      <label>Dialogue <textarea bind:value={leftText} rows="2"></textarea></label>
    </fieldset>
    <fieldset>
      <legend>Right speaker</legend>
      <label>Name <input type="text" bind:value={rightName} /></label>
      <label>Extension (optional) <input type="text" bind:value={rightExtension} /></label>
      <label>Parenthetical (optional) <input type="text" bind:value={rightParenthetical} /></label>
      <label>Dialogue <textarea bind:value={rightText} rows="2"></textarea></label>
    </fieldset>
  {/if}

  {#if error}
    <p class="form-error">{error}</p>
  {/if}

  <button type="submit">Add element</button>
</form>

<style>
  .add-element-form {
    --form-bg: #fff;
    --form-fg: #1a1a1c;
    --form-border: #d8d8dc;
    --form-accent: #6d4aff;

    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: min(420px, 100%);
    margin-inline: auto;
    padding: 1.25rem;
    box-sizing: border-box;
    background: var(--form-bg);
    color: var(--form-fg);
    border: 1px solid var(--form-border);
    border-radius: 10px;
    font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
  }

  @media (prefers-color-scheme: dark) {
    .add-element-form {
      --form-bg: #1f2028;
      --form-fg: #e6e6e8;
      --form-border: #34353f;
      --form-accent: #a78bfa;
    }
  }

  h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-weight: 500;
  }

  input,
  select,
  textarea {
    font: inherit;
    padding: 0.4rem 0.5rem;
    border: 1px solid var(--form-border);
    border-radius: 6px;
    background: transparent;
    color: inherit;
  }

  textarea {
    resize: vertical;
  }

  fieldset {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border: 1px solid var(--form-border);
    border-radius: 8px;
    padding: 0.6rem 0.75rem 0.75rem;
  }

  legend {
    padding: 0 0.3rem;
    font-weight: 600;
  }

  .form-error {
    margin: 0;
    color: #e5484d;
    font-size: 13px;
  }

  button {
    align-self: flex-start;
    font: inherit;
    font-weight: 600;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    background: var(--form-accent);
    color: #fff;
    cursor: pointer;
  }

  button:hover {
    filter: brightness(1.05);
  }
</style>
