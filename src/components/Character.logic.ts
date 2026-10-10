// Logic from Character.svelte as plain TypeScript (the component itself is unchanged).

export interface Props {
  name: string;
  /** e.g. "V.O.", "O.S.", "CONT'D" */
  extension?: string;
}

/** The extension as displayed after the name, e.g. "(V.O.)", or null when there is none. */
export function formatExtension(extension?: string): string | null {
  return extension ? `(${extension})` : null;
}
