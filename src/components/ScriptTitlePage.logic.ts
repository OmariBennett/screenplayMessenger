// Logic from ScriptTitlePage.svelte as plain TypeScript (the component itself is unchanged).
import type { ScreenplayData } from '../data/screenplayTypes';

export type TitlePage = Pick<ScreenplayData, 'title' | 'byline' | 'contact'>;

/** The fields shown on the title page. */
export function getTitlePage({ title, byline, contact }: TitlePage): TitlePage {
  return { title, byline, contact };
}
