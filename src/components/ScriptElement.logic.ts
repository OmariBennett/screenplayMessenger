// Logic from ScriptElement.svelte as plain TypeScript (the component itself is unchanged).
import type { ScreenplayElement } from '../data/screenplayTypes';

export interface Props {
  el: ScreenplayElement;
}

/** Maps each element type to the component ScriptElement renders for it. */
export const COMPONENT_FOR_TYPE = {
  sceneHeading: 'SceneHeading',
  subheading: 'Subheading',
  action: 'Action',
  character: 'Character',
  parenthetical: 'Parenthetical',
  dialogue: 'Dialogue',
  transition: 'Transition',
  dualDialogue: 'DualDialogue'
} as const satisfies Record<ScreenplayElement['type'], string>;

/** The component name for an element, or null for an unknown type (which renders nothing). */
export function componentFor(el: { type: string }): string | null {
  return COMPONENT_FOR_TYPE[el.type as keyof typeof COMPONENT_FOR_TYPE] ?? null;
}
