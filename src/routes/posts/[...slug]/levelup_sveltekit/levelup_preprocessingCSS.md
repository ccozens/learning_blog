---
title: Preprocessing CSS in Sveltekit
date: '2023-07-07'
description: Intro to preprocessing CSS in sveltekit
tags:
  - levelup
  - sveltekit
  - postCSS
---
## [Preprocessing CSS](https://levelup.video/tutorials/sveltekit/preprocessing-css)

[Preprocessors](https://kit.svelte.dev/docs/integrations#preprocessors) transform your .svelte files before passing them to the compiler. For example, if your .svelte file uses TypeScript and PostCSS, it must first be transformed into JavaScript and CSS so that the Svelte compiler can handle it.


## To use `svelte-preprocess`
1. `pnpm add --save-dev svelte-preprocess`
2. Head to `svelte.config.js`:

```javascript
import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess'; // add me

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess(), // add me
	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter(),
		alias: {
			$db: './src/db',
		},
	}
};

export default config;
```

4. install postCSS: ```pnpm add --save-dev postcss```
5. Restart dev server as good practice after updating config. svelte-preprocess pretty much handles the rest after we tell it to use the plugin.
6. In a svelte file, eg ```src/routes/+layout.svelte```, update style tag:  ```<style lang="postcss">```
