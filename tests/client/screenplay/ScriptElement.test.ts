import { describe, expect, it } from 'vitest';
import ScriptElement from '../../../src/components/ScriptElement.svelte';
import Action from '../../../src/components/Action.svelte';
import Character from '../../../src/components/Character.svelte';
import DualDialogue from '../../../src/components/DualDialogue.svelte';
import ScriptTitlePage from '../../../src/components/ScriptTitlePage.svelte';
import screenplayData from '../../../src/data/screenplayData.json';
import type { ScreenplayElement } from '../../../src/data/screenplayTypes';
import { render, text } from '../helpers/render';

function renderEl(el: ScreenplayElement) {
	return render(ScriptElement, { el });
}

describe('ScriptElement dispatches each element type to its component', () => {
	it.each([
		['sceneHeading', 'scene-heading', 'INT. KITCHEN – DAY'],
		['subheading', 'subheading', 'LATER'],
		['parenthetical', 'parenthetical', '(quietly)'],
		['dialogue', 'dialogue', 'Hello.'],
		['transition', 'transition', 'CUT TO:'],
	] as const)('%s → <p class="%s">', (type, className, value) => {
		const { container } = renderEl({ type, text: value } as ScreenplayElement);
		const p = container.querySelector('p')!;
		expect(p.className).toBe(className);
		expect(p.textContent).toBe(value);
		expect(container.children).toHaveLength(1);
	});

	it('action → <p class="action">', () => {
		const { get } = renderEl({ type: 'action', text: 'She runs.' });
		expect(text(get('p.action'))).toBe('She runs.');
	});

	it('character → <p class="character">', () => {
		const { get } = renderEl({ type: 'character', name: 'JANE', extension: 'V.O.' });
		expect(get('p.character').firstChild!.textContent).toBe('JANE');
		expect(text(get('p.character .extension'))).toBe('(V.O.)');
	});

	it('dualDialogue → side-by-side speakers', () => {
		const { get } = renderEl({
			type: 'dualDialogue',
			left: { name: 'A', text: 'one' },
			right: { name: 'B', text: 'two' },
		});
		expect(get('.dual-dialogue').children).toHaveLength(2);
	});

	it('renders nothing for an unknown type', () => {
		const { container } = renderEl({ type: 'montage', text: 'x' } as unknown as ScreenplayElement);
		expect(container.textContent).toBe('');
	});

	it('renders plain-text elements as text, never HTML', () => {
		const { container } = renderEl({ type: 'dialogue', text: '<img src=x onerror=alert(1)>' });
		expect(container.querySelector('img')).toBeNull();
	});
});

describe('Action', () => {
	it('renders text without emphasis by default', () => {
		const { get } = render(Action, { text: 'Rain falls.' });
		expect(get('p.action').innerHTML).toBe('Rain falls.');
	});

	it('wraps each emphasis word in .script-caps', () => {
		const { all } = render(Action, { text: 'RAIN taps. A CRASH.', caps: ['RAIN', 'CRASH'] });
		expect(all('.script-caps').map((s) => s.textContent)).toEqual(['RAIN', 'CRASH']);
	});

	it('wraps every occurrence of an emphasis word', () => {
		const { all } = render(Action, { text: 'BANG. Silence. BANG.', caps: ['BANG'] });
		expect(all('.script-caps')).toHaveLength(2);
	});

	it('is case-sensitive (only exact matches are emphasised)', () => {
		const { all } = render(Action, { text: 'rain, then RAIN', caps: ['RAIN'] });
		expect(all('.script-caps')).toHaveLength(1);
	});

	it('keeps the full text intact around emphasis', () => {
		const { get } = render(Action, { text: 'A laptop glows. RAIN taps the window.', caps: ['RAIN'] });
		expect(get('p.action').textContent).toBe('A laptop glows. RAIN taps the window.');
	});

	it('ignores emphasis words that do not appear', () => {
		const { all } = render(Action, { text: 'Quiet.', caps: ['THUNDER'] });
		expect(all('.script-caps')).toHaveLength(0);
	});

	// BUG (security): Action uses {@html} on raw text, and AddElementForm feeds it user input,
	// so markup in an action line is injected into the page (XSS).
	it.fails('renders the action text as text, not HTML', () => {
		const { container } = render(Action, { text: '<img src=x onerror="alert(1)">', caps: [] });
		expect(container.querySelector('img')).toBeNull();
	});

	// BUG: emphasis is applied by string replacement over HTML that already contains
	// `<span class="script-caps">`, so a short word like "s" or "an" also matches inside
	// the markup and corrupts it.
	it.fails('does not corrupt markup when an emphasis word also appears in the inserted tags', () => {
		const { get } = render(Action, { text: 'RAIN on a span', caps: ['RAIN', 'span'] });
		expect(get('p.action').textContent).toBe('RAIN on a span');
		expect(get('p.action').querySelectorAll('.script-caps')).toHaveLength(2);
	});
});

describe('Character', () => {
	it('renders just the name when there is no extension', () => {
		const { get } = render(Character, { name: 'JANE' });
		expect(get('p.character').textContent).toBe('JANE');
		expect(get('p.character').querySelector('.extension')).toBeNull();
	});

	it('renders the extension in parentheses', () => {
		const { get } = render(Character, { name: 'JANE', extension: "CONT'D" });
		expect(text(get('.extension'))).toBe("(CONT'D)");
	});

	// BUG: Svelte trims whitespace at the start of an {#if} block, so the space in
	// `{name}{#if extension} <span…>` is dropped and the cue renders as "JANE(V.O.)".
	// The reference markup in index.html has "JANE (V.O.)".
	it.fails('separates the name and extension with a space', () => {
		const { get } = render(Character, { name: 'JANE', extension: 'V.O.' });
		expect(get('p.character').textContent).toBe('JANE (V.O.)');
	});

	it('treats an empty extension as none', () => {
		const { get } = render(Character, { name: 'JANE', extension: '' });
		expect(get('p.character').querySelector('.extension')).toBeNull();
	});
});

describe('DualDialogue', () => {
	it('renders each side’s character, optional parenthetical and dialogue in order', () => {
		const { get } = render(DualDialogue, {
			left: { name: 'ANA', extension: 'O.S.', parenthetical: '(shouting)', text: 'Now!' },
			right: { name: 'BEN', text: 'Wait!' },
		});
		const [left, right] = [...get('.dual-dialogue').children];
		expect([...left.children].map((c) => c.className)).toEqual(['character', 'parenthetical', 'dialogue']);
		expect([...left.children].map((c) => text(c))).toEqual([expect.stringMatching(/^ANA ?\(O\.S\.\)$/), '(shouting)', 'Now!']);
		expect([...right.children].map((c) => c.className)).toEqual(['character', 'dialogue']);
		expect(text(right)).toBe('BEN Wait!');
	});
});

describe('ScriptTitlePage', () => {
	it('shows the title, byline and contact details from the screenplay data', () => {
		const { get } = render(ScriptTitlePage, {});
		expect(text(get('.title'))).toBe(screenplayData.title);
		// Lines are separated by <br>, which has no text of its own.
		const lines = (el: Element) => [...el.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent);
		expect(lines(get('.byline'))).toEqual(['Written by', screenplayData.byline]);
		expect(get('.byline').querySelector('br')).not.toBeNull();
		expect(lines(get('.contact'))).toEqual([screenplayData.contact.name, screenplayData.contact.email]);
	});
});
