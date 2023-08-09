---
title: Search
description: Search component
date: 2023-08-08
tags:
    - learning_blog
    - sveltekit
    - components
    - search
---

bla

```typescript:Matches.svelte
<script lang="ts">
	import type { Post } from '$lib/types';

	export let matches: Post[] = [];
	export let heading = '';
</script>

{#if matches.length > 0}
	<h2>{heading}</h2>
	<ul>
		{#each matches as match}
			<li>
				<a data-sveltekit-reload href="/posts/{match.slug}">
					<h2>{match.metadata.title}</h2>
				</a>
				<p>{match.metadata.description}</p>
			</li>
		{/each}
	</ul>
{/if}
```

[data-sveltekit-reload](https://kit.svelte.dev/docs/link-options#data-sveltekit-reload) is used to reload the page when the link is clicked. This is necessary because the search results are not part of the page's initial HTML, so the page would not be reloaded otherwise.
