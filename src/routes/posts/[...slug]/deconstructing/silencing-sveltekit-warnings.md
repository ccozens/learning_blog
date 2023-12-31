---
title: Silencing SvelteKit Warnings
description: How to silence warnings generated by svelte's compiler
date: 2023-09-07
tags:
    - learning
    - svelte
    - warnings
---

<!-- vscode-markdown-toc -->

-   1. [The Problem](#TheProblem)
-   2. [The Solution](#TheSolution)

<!-- vscode-markdown-toc-config
	numbering=true
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->

## 1. <a name='TheProblem'></a>The Problem

I ran into an issue where I was getting a warning from svelte's compiler. The warning was:

```bash
11:05:33 [vite-plugin-svelte] /src/routes/posts/[...slug]/deconstructing/deconstructing_sveltekit_search.md:2044:12 A11y: <a> element should have child content
```

This is svelte helpfully providing [accessibility warnings](https://svelte.dev/docs/accessibility-warnings), in this case an [a11y-missing-content](https://svelte.dev/docs/accessibility-warnings#a11y-missing-content) warning to highlight that an anchor tag has no content. This was generated because the table of contents for my markdown files, generated by [Markdown TOC](https://github.com/joffreykern/vscode-markdown-toc), generates tags that look like:
`#### 3.4.5. <a name='SearchResults.svelte'></a>SearchResults.svelte`.

However, I didn't want these warnings as I was happy with the way the table of contents was being generated, and I didn't want to have to add content to the anchor tags. I also didn't want to disable all warnings, as I wanted to be able to see other warnings that might be generated.

## 2. <a name="TheSolution"></a>The Solution

The solution is to use the `onwarn` option provided by [vite-plugin-svelte](https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/config.md#onwarn), which handles warnings emitted from the Svelte compiler:

```javascript
export default defineConfig({
	plugins: [
		svelte({
			onwarn(warning, defaultHandler) {
				// don't warn on <marquee> elements, cos they're cool
				if (warning.code === 'a11y-distracting-elements') return;

				// handle all other warnings normally
				defaultHandler(warning);
			}
		})
	]
});
```

That's the example from the docs,and it worked perfectly when added in.
