import { describe, expect, it } from 'vitest';
import App from '../../../src/App.svelte';
import { render, submit, text, type } from '../helpers/render';

// App seeds its $state from the imported JSON module, which is shared by every test in
// this file. Expectations are therefore taken from the DOM at setup, not from the JSON.
function setup() {
	const view = render(App, {});
	const field = (label: string) =>
		[...view.container.querySelectorAll('.add-element-form label')]
			.find((l) => text(l).startsWith(label))!
			.querySelector('input, textarea, select')!;
	const pages = () => view.all('.script-page[data-page]');
	const pageContent = (n: number) => view.get(`.script-page[data-page="${n}"] .script-page-content`);
	const addAction = (value: string, target: { page?: number; asNew?: boolean } = {}) => {
		if (target.asNew) type(field('Add to'), 'new');
		else if (target.page) type(field('Page'), String(target.page));
		type(field('Text'), value);
		submit(view.get('.add-element-form'));
	};
	const pageCount = pages().length;
	const lastPage = Number(pages().at(-1)!.dataset.page);
	return { ...view, pages, pageContent, addAction, field, pageCount, lastPage };
}

describe('App', () => {
	it('renders the title page followed by every screenplay page, numbered from 1', async () => {
		const data = (await import('../../../src/data/screenplayData.json')).default;
		const { all, pages } = setup();
		const wraps = all('.script-canvas > .script-page-wrap');
		expect(wraps[0].querySelector('.script-title-page')).not.toBeNull();
		expect(wraps).toHaveLength(pages().length + 1);
		expect(pages().map((p) => p.dataset.page)).toEqual(data.pages.map((p) => String(p.page)));
	});

	it('renders every element of every page', async () => {
		const data = (await import('../../../src/data/screenplayData.json')).default;
		const { pageContent } = setup();
		for (const p of data.pages) {
			expect(pageContent(p.page).children, `page ${p.page}`).toHaveLength(p.elements.length);
		}
	});

	it('the title page has no page number', () => {
		const { get } = setup();
		expect(get('.script-title-page').closest('.script-page')!.hasAttribute('data-page')).toBe(false);
	});

	it('puts the add-element form above the script', () => {
		const { get } = setup();
		const main = get('main');
		expect(main.firstElementChild!.classList.contains('add-element-form')).toBe(true);
	});

	it('appends a new element to the end of the chosen page', () => {
		const { pageContent, addAction } = setup();
		const before = pageContent(1).children.length;
		addAction('A door slams.', { page: 1 });
		expect(pageContent(1).children).toHaveLength(before + 1);
		expect(text(pageContent(1).lastElementChild)).toBe('A door slams.');
	});

	it('leaves other pages untouched', () => {
		const { pageContent, addAction } = setup();
		const before = pageContent(2).innerHTML;
		addAction('x', { page: 1 });
		expect(pageContent(2).innerHTML).toBe(before);
	});

	it('creates a new page numbered after the last one', () => {
		const { pages, pageContent, addAction, pageCount, lastPage } = setup();
		addAction('FADE IN on a new page.', { asNew: true });
		expect(pages()).toHaveLength(pageCount + 1);
		expect(pages().at(-1)!.dataset.page).toBe(String(lastPage + 1));
		expect(text(pageContent(lastPage + 1))).toBe('FADE IN on a new page.');
	});

	it('offers a newly created page as a target for further elements', () => {
		const { field, addAction, pageContent, lastPage } = setup();
		const next = lastPage + 1;
		addAction('first', { asNew: true });
		type(field('Add to'), 'existing');
		const options = [...(field('Page') as HTMLSelectElement).options].map((o) => o.value);
		expect(options).toContain(String(next));
		addAction('second', { page: next });
		expect(pageContent(next).children).toHaveLength(2);
	});

	it('creates consecutive new pages', () => {
		const { pages, addAction, lastPage } = setup();
		addAction('a', { asNew: true });
		addAction('b', { asNew: true });
		expect(pages().slice(-2).map((p) => p.dataset.page)).toEqual([String(lastPage + 1), String(lastPage + 2)]);
	});
});
