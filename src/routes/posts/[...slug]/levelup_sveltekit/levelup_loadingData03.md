---
title: 'Sveltekit data: parameter-based routes'
date: '2023-07-03'
description: Intro to parameter-based routes in sveltekit
tags:
  - levelup
  - sveltekit
  - data
---

[Parameter-based routes](https://levelup.video/tutorials/sveltekit/parameter-based-routes)

## Goal: get show number from route into component, and have that component load data

1. Update a element in ```+page.svelte``` to be a link to each element:

```javascript
<script>
	import Test from '$lib/Test.svelte';
	export let data;

	$: ({ latest_episode, all_episodes } = data);
</script>

<h3>{latest_episode.title}</h3>

<nav>
	<ul>
		{#each all_episodes as episode}
			<li>
				<a href={`/show/{episode.number}`}>{episode.title}</a> // modification here
			</li>
		{/each}
	</ul>
</nav>
```
2. Create new folder and a paramaterised route: ```src/routes/show/\[num\]/+page.svelte```
*Note: this creates ```src/routes/show/[num]/+page.svelte``` - the backticks are to escape the square brackets as they are used for pattern matching (and other things) in zsh.

3. Generate page data: code ```src/routes/show/\[num\]/+page.js```
4. API request:

```javascript
export async function load({ fetch, params }) {
    const res = await fetch(`https://syntax.fm/api/shows/${params.num}`);
    const data = await res.json();
    return {
        episode: data
    };
}
```

Note:
- fetch and params brought in as function parameters
- api request is to ```${params.num}```. Any time we have a parameter in a path it is available as ```params.parameter-name```. We named the folder [num], so the param is called ```params.num```.
- data is returned as object called ```episode```.
5. in ```src/routes/show/\[num\]/+page.svelte```:

```javascript
<script>
	export let data;

	$: ({ episode } = data);
</script>

<h3>{episode.title}</h3>

<h4>{episode.number}</h4>

{@html episode.html}

```

[Note ```@html``` tag](https://svelte.dev/docs/special-tags#html), which directly server-side renders the imported HTML.
