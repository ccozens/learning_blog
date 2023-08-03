---
title: 'Sveltekit data: Destructuring data in a reactive statement'
date: '2023-07-03'
description: description
tags:
  - levelup
  - sveltekit
  - data
---
[Practical loading](https://levelup.video/tutorials/sveltekit/practical-loading)

## Destructuring data in a reactive statement

By default, JS in a svelte component script tag is not reactive - that is, it does not run on each re-render like a react component. ```$``` notation denotes reactive variable that does re-run.

Here:

```javascript
<script>
	$: ({ latest_episode } = data)
</script>
```

```data.latest_episode``` can now be accessed in markup:
```<h1>{latest_episode}</h1>```

## Render all_episodes as an array:

1. Hit API to get all_episodes:

```javascript
/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
    const res = await fetch('https://syntax.fm/api/shows/latest');
    const all_ep_res = await fetch('https://syntax.fm/api/shows');

    const data = await res.json();
    const all_ep_data = await all_ep_res.json();

    return {
        latest_episode: data,
        all_episodes: all_ep_data
        ,
    }
}
```

2. Add all_episodes to destructuring and render links (anchor elements) as li elements within ul:

```javascript
	<script>
		export let data;

		$: ({ latest_episode, all_episodes } = data);
	</script>

	<h3>{latest_episode.title}</h3>

	<nav>
		<ul>
			{#each all_episodes as episode}
				<li>
					<a href="">{episode.title}</a>
				</li>
			{/each}
		</ul>
	</nav>
```
