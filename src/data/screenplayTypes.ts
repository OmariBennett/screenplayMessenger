export interface SceneHeadingElement {
  type: 'sceneHeading';
  text: string;
}

export interface SubheadingElement {
  type: 'subheading';
  text: string;
}

export interface ActionElement {
  type: 'action';
  text: string;
  /** Substrings of `text` to render in the ALL-CAPS emphasis style. */
  caps?: string[];
}

export interface CharacterElement {
  type: 'character';
  name: string;
  /** e.g. "V.O.", "O.S.", "CONT'D" */
  extension?: string;
}

export interface ParentheticalElement {
  type: 'parenthetical';
  text: string;
}

export interface DialogueElement {
  type: 'dialogue';
  text: string;
}

export interface TransitionElement {
  type: 'transition';
  text: string;
}

export interface DualDialogueSpeaker {
  name: string;
  extension?: string;
  parenthetical?: string;
  text: string;
}

export interface DualDialogueElement {
  type: 'dualDialogue';
  left: DualDialogueSpeaker;
  right: DualDialogueSpeaker;
}

export type ScreenplayElement =
  | SceneHeadingElement
  | SubheadingElement
  | ActionElement
  | CharacterElement
  | ParentheticalElement
  | DialogueElement
  | TransitionElement
  | DualDialogueElement;

export interface ScreenplayPage {
  page: number;
  elements: ScreenplayElement[];
}

export interface ScreenplayData {
  title: string;
  byline: string;
  contact: {
    name: string;
    email: string;
  };
  pages: ScreenplayPage[];
}
