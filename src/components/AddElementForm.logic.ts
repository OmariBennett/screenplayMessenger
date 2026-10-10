// Logic from AddElementForm.svelte as plain TypeScript (the component itself is unchanged).
import type { ScreenplayElement, ScreenplayPage } from '../data/screenplayTypes';

export type ElementType = ScreenplayElement['type'];
export type AddTarget = { pageNumber: number; asNewPage: boolean };
export type Destination = 'existing' | 'new';

export interface Props {
  pages: ScreenplayPage[];
  onAdd: (target: AddTarget, element: ScreenplayElement) => void;
}

export const ELEMENT_TYPES = [
  { value: 'sceneHeading', label: 'Scene Heading' },
  { value: 'subheading', label: 'Subheading' },
  { value: 'action', label: 'Action' },
  { value: 'character', label: 'Character' },
  { value: 'parenthetical', label: 'Parenthetical' },
  { value: 'dialogue', label: 'Dialogue' },
  { value: 'transition', label: 'Transition' },
  { value: 'dualDialogue', label: 'Dual Dialogue' }
] as const;

/** Element types whose only field is a single line of text. */
export const TEXT_ONLY_TYPES = ['sceneHeading', 'subheading', 'parenthetical', 'dialogue', 'transition'] as const;

export const REQUIRED_FIELDS_ERROR = 'Fill in the required fields for this element type.';

export interface FormFields {
  text: string;
  caps: string;
  name: string;
  extension: string;
  leftName: string;
  leftExtension: string;
  leftParenthetical: string;
  leftText: string;
  rightName: string;
  rightExtension: string;
  rightParenthetical: string;
  rightText: string;
}

export function emptyFields(): FormFields {
  return {
    text: '',
    caps: '',
    name: '',
    extension: '',
    leftName: '',
    leftExtension: '',
    leftParenthetical: '',
    leftText: '',
    rightName: '',
    rightExtension: '',
    rightParenthetical: '',
    rightText: ''
  };
}

export function isTextOnlyType(type: ElementType): type is (typeof TEXT_ONLY_TYPES)[number] {
  return (TEXT_ONLY_TYPES as readonly string[]).includes(type);
}

/** The page the form targets by default: the last existing page, or 1 if there are none. */
export function defaultTargetPage(pages: ScreenplayPage[]): number {
  return pages.at(-1)?.page ?? 1;
}

/** "RAIN, , CRASH ," → ["RAIN", "CRASH"] */
export function parseCaps(caps: string): string[] {
  return caps.split(',').map((s) => s.trim()).filter(Boolean);
}

/** Builds the element for `type` from the form fields, or null if a required field is blank. */
export function buildElement(type: ElementType, f: FormFields): ScreenplayElement | null {
  switch (type) {
    case 'sceneHeading':
    case 'subheading':
    case 'parenthetical':
    case 'dialogue':
    case 'transition':
      return f.text.trim() ? { type, text: f.text.trim() } : null;
    case 'action': {
      if (!f.text.trim()) return null;
      const capsList = parseCaps(f.caps);
      return { type, text: f.text.trim(), ...(capsList.length ? { caps: capsList } : {}) };
    }
    case 'character':
      return f.name.trim()
        ? { type, name: f.name.trim(), ...(f.extension.trim() ? { extension: f.extension.trim() } : {}) }
        : null;
    case 'dualDialogue':
      if (!f.leftName.trim() || !f.leftText.trim() || !f.rightName.trim() || !f.rightText.trim()) return null;
      return {
        type,
        left: {
          name: f.leftName.trim(),
          text: f.leftText.trim(),
          ...(f.leftExtension.trim() ? { extension: f.leftExtension.trim() } : {}),
          ...(f.leftParenthetical.trim() ? { parenthetical: f.leftParenthetical.trim() } : {})
        },
        right: {
          name: f.rightName.trim(),
          text: f.rightText.trim(),
          ...(f.rightExtension.trim() ? { extension: f.rightExtension.trim() } : {}),
          ...(f.rightParenthetical.trim() ? { parenthetical: f.rightParenthetical.trim() } : {})
        }
      };
    default:
      return null;
  }
}

export function toAddTarget(targetPage: number, destination: Destination): AddTarget {
  return { pageNumber: targetPage, asNewPage: destination === 'new' };
}
