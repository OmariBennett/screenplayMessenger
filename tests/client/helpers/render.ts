import { flushSync, mount, unmount, type Component } from 'svelte';
import { afterEach } from 'vitest';

const mounted: Array<{ instance: Record<string, unknown>; target: HTMLElement }> = [];

afterEach(() => {
	while (mounted.length) {
		const { instance, target } = mounted.pop()!;
		unmount(instance);
		target.remove();
	}
});

/** Mounts a component into a fresh container and flushes the first render. */
export function render<Props extends Record<string, any>>(component: Component<Props>, props: Props) {
	const target = document.createElement('div');
	document.body.appendChild(target);
	const instance = mount(component, { target, props });
	flushSync();
	mounted.push({ instance, target });
	return {
		container: target,
		get: <T extends Element = HTMLElement>(selector: string) => {
			const el = target.querySelector<T>(selector);
			if (!el) throw new Error(`No element matches "${selector}"`);
			return el;
		},
		all: <T extends Element = HTMLElement>(selector: string) => [...target.querySelectorAll<T>(selector)],
	};
}

export function text(el: Element | null | undefined) {
	return (el?.textContent ?? '').replace(/\s+/g, ' ').trim();
}

export function click(el: Element) {
	(el as HTMLElement).click();
	flushSync();
}

/** Sets a form control's value and fires the event `bind:value` listens for. */
export function type(el: Element, value: string) {
	const control = el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
	control.value = value;
	control.dispatchEvent(new Event(control instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }));
	flushSync();
}

export function submit(form: Element) {
	(form as HTMLFormElement).dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
	flushSync();
}

export function buttonByText(root: ParentNode, label: string) {
	const btn = [...root.querySelectorAll('button')].find((b) => text(b) === label);
	if (!btn) throw new Error(`No button labelled "${label}"`);
	return btn;
}
