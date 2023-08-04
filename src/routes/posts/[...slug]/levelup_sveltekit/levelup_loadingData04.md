---
title: 'Sveltekit data: loading in layouts'
date: '2023-07-26'
description: Intro to loading data in layouts in sveltekit
tags:
  - levelup
  - sveltekit
---
[Loading in layouts](https://levelup.video/tutorials/sveltekit/loading-in-layouts)

## Layouts and data

### Loading data into layouts
Very similar to pages!

1. Create 2 files:
	```code src/routes/+layout.js```
	```code src/routes/Episodes.js```

2. ```+layout.js``` takes the code we wrote earlier in ```+page.js``` to import all episodes;

```javascript
export async function load({ fetch }) {
    const all_ep_res = await fetch('https://syntax.fm/api/shows');

    const all_ep_data = await all_ep_res.json();

    return {
        all_episodes: all_ep_data
        ,
    }
}
```

3. ```Episodes.svelte``` takes the nav code from ```page.svelte```:

```javascript
<script>
    export let episodes;
</script>


<nav>
	<ul>
		{#each episodes as episode}
			<li>
				<a href={```/show/${episode.number}```}>{episode.title}</a>
			</li>
		{/each}
	</ul>
</nav>
```

4. And then update '+layout.svelte' to pass all_episodes to ```<Episodes />``` as a the episodes prop:

```javascript
<script>
    import Header from './Header.svelte';
    import Footer from './Footer.svelte';
    import './styles.css';
	import Episodes from './Episodes.svelte';

    export let data;
    $: ({ all_episodes } = data);
</script>

<Header />

<main>
	<slot />
    <Episodes episodes={all_episodes} />
</main>

<Footer />
```

#### Why?
Prefetching! This is *really fast* - the nav element is now pre-fetched and doesn't reload on each page. The interior content of the page is able to update without affecting the layout, and without affecting the SSR.

### Develop an interface
Update markup of ```+layout.svelte```
1. create some more HTML depth

```html
<main>
    <div class="main">
        <slot />
    </div>
		<aside>
			<h3>All episodes</h3>
			<Episodes episodes={all_episodes} />
		</aside>
</main>
```

2. Add a style tag for scoped CSS under the HTML:

```css
<style>
    main {
        display: grid;
        grid-template-columns: 1fr 300px;
    }
</style>
```

This creates 2 columns: 300px for the nav and 1fr (ie the rest of the space) for the main (here, slot content).

3. Should we decide to swap these, one can amend the aside order:

```css
<style>
    main {
        display: grid;
        grid-template-columns: 300px 1fr;
        gap: 20px;
    }

    aside {
        order: -1;
    }
</style>
```

...and now the aside shows on left hand side, as we are used ot seeing nav menus. Note the grid-template-columns order was swapped so the aside remains at 300px, and that we added a 20px gap for readability.

4. Remember to remove ```all_episodes``` from ```+page.svelte``` and ```+page.js```.


## Accessing data that has already been loaded in a single higher up load function

[Load function](https://kit.svelte.dev/docs/load) has several helpers, eg fetch, params and **parent**. [Parent](https://kit.svelte.dev/docs/load#using-parent-data) has different functions in ```.server.js``` and ```.js``` files:
	- in ```+page.server.js``` and ```+layout.server.js```, parent returns data from parent ```+layout.server.js``` files.
	- in ```+page.js``` or ```+layout.js``` it will return data from parent ```+layout.js``` files.
		- note that this goes up multiple layers: a parent function in ```src/routes/abc/+page.js``` will receive merged data from ```src/routes/abc/+layout.svelte``` and ```src/routes/+layout.svelte```.

To implement here:
1. Update ```src/routes/page.js```:

```javascript
	export async function load({ fetch, parent }) {
    const parentData = await parent();

    const res = await fetch('https://syntax.fm/api/shows/latest');

    const data = await res.json();

    return {
        latest_episode: data,

    }
}
```

This data can now be used in page.

2. The exact same code works in ```src/routes/[num]/page.js```:

```javascript
export async function load({ fetch, params, parent }) {
    const res = await fetch(`https://syntax.fm/api/shows/${params.num}`);
    const parentData = await parent();
    console.log(parentData);
    const data = await res.json();
    return {
        episode: data
    };
}
```

Note that this receives the all_episodes data. This makes sense, as the only things loaded when navigating to a specific show page are the page.js from the current route and any layout wrapping it. There is no layout in ```src/routes/[num]```, and there is within ```src/routes```, so this receives data from ```src/routes/+layout.js```;
