import { describe, expect, it } from 'vitest';
import data from '../../../src/data/screenplayData.json';
import type { ScreenplayData, ScreenplayElement } from '../../../src/data/screenplayTypes';

// The JSON is cast to ScreenplayData at runtime with no validation, so these tests are
// the only guard against a hand-edit that the components can't render.
const screenplay = data as ScreenplayData;
const allElements = screenplay.pages.flatMap((p) => p.elements.map((el) => ({ page: p.page, el })));

const nonEmpty = (v: unknown) => typeof v === 'string' && v.trim().length > 0;

function validate(el: ScreenplayElement): string[] {
	const problems: string[] = [];
	const need = (field: string, value: unknown) => {
		if (!nonEmpty(value)) problems.push(`${el.type}.${field} must be a non-empty string`);
	};
	switch (el.type) {
		case 'sceneHeading':
		case 'subheading':
		case 'parenthetical':
		case 'dialogue':
		case 'transition':
			need('text', el.text);
			break;
		case 'action':
			need('text', el.text);
			if (el.caps !== undefined) {
				if (!Array.isArray(el.caps)) problems.push('action.caps must be an array');
				for (const word of el.caps ?? []) {
					if (!nonEmpty(word)) problems.push('action.caps entries must be non-empty');
					else if (!el.text.includes(word)) problems.push(`caps word "${word}" does not appear in the text`);
				}
			}
			break;
		case 'character':
			need('name', el.name);
			if (el.extension !== undefined) need('extension', el.extension);
			break;
		case 'dualDialogue':
			for (const side of ['left', 'right'] as const) {
				need(`${side}.name`, el[side]?.name);
				need(`${side}.text`, el[side]?.text);
			}
			break;
		default:
			problems.push(`unknown element type "${(el as { type: string }).type}"`);
	}
	return problems;
}

describe('screenplayData.json', () => {
	it('has title-page details', () => {
		expect(nonEmpty(screenplay.title)).toBe(true);
		expect(nonEmpty(screenplay.byline)).toBe(true);
		expect(nonEmpty(screenplay.contact.name)).toBe(true);
		expect(screenplay.contact.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
	});

	it('has at least one page', () => {
		expect(screenplay.pages.length).toBeGreaterThan(0);
	});

	it('numbers pages 1..N in order with no gaps or duplicates (pages are keyed by number)', () => {
		expect(screenplay.pages.map((p) => p.page)).toEqual(screenplay.pages.map((_, i) => i + 1));
	});

	it('has no empty pages', () => {
		for (const p of screenplay.pages) expect(p.elements.length, `page ${p.page}`).toBeGreaterThan(0);
	});

	it('contains only valid, renderable elements', () => {
		const problems = allElements.flatMap(({ page, el }) => validate(el).map((msg) => `page ${page}: ${msg}`));
		expect(problems).toEqual([]);
	});

	it('starts every page with a scene heading, subheading, character or action', () => {
		// A page that opens with dialogue/parenthetical would be orphaned from its speaker.
		for (const p of screenplay.pages) {
			expect(['sceneHeading', 'subheading', 'character', 'action', 'transition'], `page ${p.page}`).toContain(
				p.elements[0].type,
			);
		}
	});

	it('only places dialogue and parentheticals after a character (or another dialogue line)', () => {
		const speakerContext = new Set(['character', 'parenthetical', 'dialogue']);
		for (const p of screenplay.pages) {
			p.elements.forEach((el, i) => {
				if (el.type !== 'dialogue' && el.type !== 'parenthetical') return;
				const prev = p.elements[i - 1];
				expect(prev && speakerContext.has(prev.type), `page ${p.page} element ${i} (${el.type})`).toBe(true);
			});
		}
	});
});
