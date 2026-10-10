// Logic from ScriptPage.svelte as plain TypeScript (the component itself is unchanged).
// ScriptPage is a layout wrapper; the page number is exposed as data-page (omitted when unset).
import type { Snippet } from 'svelte';

export interface Props {
  page?: number;
  children: Snippet;
}
