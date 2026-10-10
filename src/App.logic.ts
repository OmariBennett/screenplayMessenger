// Logic from App.svelte as plain TypeScript (the component itself is unchanged).
import type { ScreenplayData, ScreenplayElement } from './data/screenplayTypes';

export type AddTarget = { pageNumber: number; asNewPage: boolean };

/** The number a newly created page gets: one after the last page (1 if there are none). */
export function nextPageNumber(data: ScreenplayData): number {
	return (data.pages.at(-1)?.page ?? 0) + 1;
}

/**
 * Adds `element` to the screenplay, mutating `data` in place (App passes its $state proxy).
 * Returns the page number it landed on, or null if the target page doesn't exist.
 */
export function addElementToScreenplay(
	data: ScreenplayData,
	target: AddTarget,
	element: ScreenplayElement
): number | null {
	if (target.asNewPage) {
		const page = nextPageNumber(data);
		data.pages.push({ page, elements: [element] });
		return page;
	}
	const page = data.pages.find((p) => p.page === target.pageNumber);
	if (!page) return null;
	page.elements.push(element);
	return page.page;
}
