import { describe, expect, it, vi } from 'vitest';
import AddElementForm from '../../../src/components/AddElementForm.svelte';
import type { ScreenplayPage } from '../../../src/data/screenplayTypes';
import { render, submit, text, type } from '../helpers/render';

const PAGES: ScreenplayPage[] = [
	{ page: 1, elements: [] },
	{ page: 2, elements: [] },
	{ page: 3, elements: [] },
];

function setup(pages: ScreenplayPage[] = PAGES) {
	const onAdd = vi.fn();
	const view = render(AddElementForm, { pages, onAdd });

	const field = (label: string, root: ParentNode = view.container) => {
		const lbl = [...root.querySelectorAll('label')].find((l) => text(l).startsWith(label));
		if (!lbl) throw new Error(`No field labelled "${label}"`);
		return lbl.querySelector('input, textarea, select')!;
	};
	const speaker = (side: 'Left' | 'Right') =>
		[...view.container.querySelectorAll('fieldset')].find((f) => text(f.querySelector('legend')) === `${side} speaker`)!;

	return {
		...view,
		onAdd,
		field,
		speaker,
		selectType: (value: string) => type(field('Element type'), value),
		fill: (label: string, value: string, root?: ParentNode) => type(field(label, root), value),
		submit: () => submit(view.get('form')),
		error: () => view.container.querySelector('.form-error')?.textContent ?? null,
	};
}

describe('initial state', () => {
	it('offers all eight screenplay element types', () => {
		const { field } = setup();
		const options = [...(field('Element type') as HTMLSelectElement).options].map((o) => o.value);
		expect(options).toEqual([
			'sceneHeading',
			'subheading',
			'action',
			'character',
			'parenthetical',
			'dialogue',
			'transition',
			'dualDialogue',
		]);
	});

	it('defaults to an Action on the last existing page', () => {
		const { field } = setup();
		expect((field('Element type') as HTMLSelectElement).value).toBe('action');
		expect((field('Add to') as HTMLSelectElement).value).toBe('existing');
		expect((field('Page') as HTMLSelectElement).value).toBe('3');
	});

	it('lists every page as a target', () => {
		const { field } = setup();
		expect([...(field('Page') as HTMLSelectElement).options].map((o) => o.textContent)).toEqual([
			'Page 1',
			'Page 2',
			'Page 3',
		]);
	});

	it('shows no error initially', () => {
		expect(setup().error()).toBeNull();
	});
});

describe('fields per element type', () => {
	// A label's own caption is its leading text node (the rest is the control, e.g. <option>s).
	const labels = (container: HTMLElement) =>
		[...container.querySelectorAll('label')].map((l) => l.firstChild!.textContent!.trim().split(' (')[0]);

	it.each(['sceneHeading', 'subheading', 'parenthetical', 'dialogue', 'transition'])('%s shows a single Text input', (t) => {
		const { selectType, container, field } = setup();
		selectType(t);
		expect(labels(container)).toEqual(['Element type', 'Add to', 'Page', 'Text']);
		expect(field('Text').tagName).toBe('INPUT');
	});

	it('action shows a Text area and optional emphasis words', () => {
		const { container, field } = setup();
		expect(labels(container)).toEqual(['Element type', 'Add to', 'Page', 'Text', 'Emphasis words']);
		expect(field('Text').tagName).toBe('TEXTAREA');
	});

	it('character shows Name and optional Extension', () => {
		const { selectType, container } = setup();
		selectType('character');
		expect(labels(container)).toEqual(['Element type', 'Add to', 'Page', 'Name', 'Extension']);
	});

	it('dualDialogue shows a fieldset per speaker', () => {
		const { selectType, container } = setup();
		selectType('dualDialogue');
		const legends = [...container.querySelectorAll('legend')].map((l) => l.textContent);
		expect(legends).toEqual(['Left speaker', 'Right speaker']);
		for (const fs of container.querySelectorAll('fieldset')) {
			expect(fs.querySelectorAll('input, textarea')).toHaveLength(4);
		}
	});

	it('hides the page picker when adding to a new page', () => {
		const { fill, container } = setup();
		fill('Add to', 'new');
		expect(labels(container)).not.toContain('Page');
	});
});

describe('building elements', () => {
	it.each(['sceneHeading', 'subheading', 'parenthetical', 'dialogue', 'transition'])('builds a trimmed %s', (t) => {
		const { selectType, fill, submit, onAdd } = setup();
		selectType(t);
		fill('Text', '  Some text  ');
		submit();
		expect(onAdd).toHaveBeenCalledExactlyOnceWith({ pageNumber: 3, asNewPage: false }, { type: t, text: 'Some text' });
	});

	it('builds an action without caps when no emphasis words are given', () => {
		const { fill, submit, onAdd } = setup();
		fill('Text', 'She runs.');
		submit();
		expect(onAdd.mock.calls[0][1]).toEqual({ type: 'action', text: 'She runs.' });
	});

	it('parses comma-separated emphasis words, dropping blanks', () => {
		const { fill, submit, onAdd } = setup();
		fill('Text', 'RAIN then a CRASH');
		fill('Emphasis words', ' RAIN , ,CRASH,  ');
		submit();
		expect(onAdd.mock.calls[0][1]).toEqual({ type: 'action', text: 'RAIN then a CRASH', caps: ['RAIN', 'CRASH'] });
	});

	it('omits caps when the emphasis field only has commas/spaces', () => {
		const { fill, submit, onAdd } = setup();
		fill('Text', 'x');
		fill('Emphasis words', ' , , ');
		submit();
		expect(onAdd.mock.calls[0][1]).not.toHaveProperty('caps');
	});

	it('builds a character with and without an extension', () => {
		const { selectType, fill, submit, onAdd } = setup();
		selectType('character');
		fill('Name', ' JANE ');
		submit();
		fill('Name', 'JANE');
		fill('Extension', ' V.O. ');
		submit();
		expect(onAdd.mock.calls.map((c) => c[1])).toEqual([
			{ type: 'character', name: 'JANE' },
			{ type: 'character', name: 'JANE', extension: 'V.O.' },
		]);
	});

	it('builds a dual dialogue, including only the optional parts that were filled', () => {
		const { selectType, fill, speaker, submit, onAdd } = setup();
		selectType('dualDialogue');
		const left = speaker('Left');
		const right = speaker('Right');
		fill('Name', 'ANA', left);
		fill('Extension', 'O.S.', left);
		fill('Parenthetical', '(yelling)', left);
		fill('Dialogue', ' Now! ', left);
		fill('Name', 'BEN', right);
		fill('Dialogue', 'Wait!', right);
		submit();
		expect(onAdd.mock.calls[0][1]).toEqual({
			type: 'dualDialogue',
			left: { name: 'ANA', text: 'Now!', extension: 'O.S.', parenthetical: '(yelling)' },
			right: { name: 'BEN', text: 'Wait!' },
		});
	});
});

describe('validation', () => {
	it.each(['sceneHeading', 'action', 'dialogue'])('rejects an empty %s', (t) => {
		const { selectType, submit, onAdd, error } = setup();
		selectType(t);
		submit();
		expect(onAdd).not.toHaveBeenCalled();
		expect(error()).toBe('Fill in the required fields for this element type.');
	});

	it('rejects whitespace-only text', () => {
		const { fill, submit, onAdd } = setup();
		fill('Text', '    ');
		submit();
		expect(onAdd).not.toHaveBeenCalled();
	});

	it('rejects a character without a name, even with an extension', () => {
		const { selectType, fill, submit, onAdd } = setup();
		selectType('character');
		fill('Extension', 'V.O.');
		submit();
		expect(onAdd).not.toHaveBeenCalled();
	});

	it.each([
		['left name', 'Left', 'Name'],
		['left dialogue', 'Left', 'Dialogue'],
		['right name', 'Right', 'Name'],
		['right dialogue', 'Right', 'Dialogue'],
	] as const)('rejects a dual dialogue missing the %s', (_label, side, missing) => {
		const { selectType, fill, speaker, submit, onAdd } = setup();
		selectType('dualDialogue');
		for (const s of ['Left', 'Right'] as const) {
			for (const f of ['Name', 'Dialogue']) {
				if (!(s === side && f === missing)) fill(f, 'x', speaker(s));
			}
		}
		submit();
		expect(onAdd).not.toHaveBeenCalled();
	});

	it('clears the error after a successful add', () => {
		const { fill, submit, error } = setup();
		submit();
		expect(error()).not.toBeNull();
		fill('Text', 'ok');
		submit();
		expect(error()).toBeNull();
	});
});

describe('targeting pages', () => {
	it('adds to the chosen existing page, as a number', () => {
		const { fill, submit, onAdd } = setup();
		fill('Page', '1');
		fill('Text', 'x');
		submit();
		expect(onAdd.mock.calls[0][0]).toEqual({ pageNumber: 1, asNewPage: false });
		expect(typeof onAdd.mock.calls[0][0].pageNumber).toBe('number');
	});

	it('requests a new page when "New page" is chosen', () => {
		const { fill, submit, onAdd } = setup();
		fill('Add to', 'new');
		fill('Text', 'x');
		submit();
		expect(onAdd.mock.calls[0][0].asNewPage).toBe(true);
	});

	it('defaults to page 1 when there are no pages yet', () => {
		const { fill, submit, onAdd } = setup([]);
		fill('Text', 'x');
		submit();
		expect(onAdd.mock.calls[0][0].pageNumber).toBe(1);
	});
});

describe('after a successful add', () => {
	it('clears the inputs but keeps the element type and destination', () => {
		const { selectType, fill, field, submit } = setup();
		selectType('character');
		fill('Page', '2');
		fill('Name', 'JANE');
		fill('Extension', 'V.O.');
		submit();
		expect((field('Element type') as HTMLSelectElement).value).toBe('character');
		expect((field('Page') as HTMLSelectElement).value).toBe('2');
		expect((field('Name') as HTMLInputElement).value).toBe('');
		expect((field('Extension') as HTMLInputElement).value).toBe('');
	});

	it('keeps the inputs when validation fails, so nothing typed is lost', () => {
		const { selectType, fill, field, submit } = setup();
		selectType('dualDialogue');
		fill('Name', 'ANA');
		submit();
		expect((field('Name') as HTMLInputElement).value).toBe('ANA');
	});
});
