import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [svelte()],
	// Resolve Svelte's client runtime (mount/flushSync) instead of the SSR build.
	resolve: { conditions: ['browser'] },
	test: {
		restoreMocks: true,
		unstubGlobals: true,
		environment: 'jsdom',
		include: ['tests/client/**/*.test.ts'],
		setupFiles: ['tests/client/setup.ts'],
	},
});
