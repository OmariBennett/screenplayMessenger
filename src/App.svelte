<script lang="ts">
	import ScriptCanvas from './components/ScriptCanvas.svelte';
	import ScriptPageWrap from './components/ScriptPageWrap.svelte';
	import ScriptPage from './components/ScriptPage.svelte';
	import ScriptTitlePage from './components/ScriptTitlePage.svelte';
	import ScriptElement from './components/ScriptElement.svelte';
	import AddElementForm from './components/AddElementForm.svelte';
	import screenplayDataJson from './data/screenplayData.json';
	import type { ScreenplayData, ScreenplayElement } from './data/screenplayTypes';

	let screenplayData = $state(screenplayDataJson as ScreenplayData);

	function handleAddElement(
		target: { pageNumber: number; asNewPage: boolean },
		element: ScreenplayElement
	) {
		if (target.asNewPage) {
			const nextPage = (screenplayData.pages.at(-1)?.page ?? 0) + 1;
			screenplayData.pages.push({ page: nextPage, elements: [element] });
			return;
		}
		const page = screenplayData.pages.find((p) => p.page === target.pageNumber);
		if (page) page.elements.push(element);
	}
</script>

<main>
	<AddElementForm pages={screenplayData.pages} onAdd={handleAddElement} />

	<ScriptCanvas>
		<ScriptPageWrap>
			<ScriptPage>
				<ScriptTitlePage />
			</ScriptPage>
		</ScriptPageWrap>

		{#each screenplayData.pages as pageData (pageData.page)}
			<ScriptPageWrap>
				<ScriptPage page={pageData.page}>
					<div class="script-page-content">
						{#each pageData.elements as el, i (i)}
							<ScriptElement {el} />
						{/each}
					</div>
				</ScriptPage>
			</ScriptPageWrap>
		{/each}
	</ScriptCanvas>
</main>
