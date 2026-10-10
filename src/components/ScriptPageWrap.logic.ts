// Logic from ScriptPageWrap.svelte as plain TypeScript (the component itself is unchanged).
// ScriptPageWrap is a layout wrapper around its children, so only its props are typed here.
import type { Snippet } from 'svelte';

export interface Props {
  children: Snippet;
}
