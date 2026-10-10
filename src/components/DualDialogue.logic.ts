// Logic from DualDialogue.svelte as plain TypeScript (the component itself is unchanged).
import type { DualDialogueSpeaker } from '../data/screenplayTypes';

export interface Props {
  left: DualDialogueSpeaker;
  right: DualDialogueSpeaker;
}

/** Whether a speaker's column includes a parenthetical line. */
export function hasParenthetical(speaker: DualDialogueSpeaker): boolean {
  return Boolean(speaker.parenthetical);
}
