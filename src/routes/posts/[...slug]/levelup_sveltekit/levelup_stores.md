---
title: Sveltekit Stores
date: '2023-07-26'
description: Intro to stores in sveltekit
tags:
  - levelup
  - sveltekit
  - stores
---
#[Stores](https://levelup.video/tutorials/sveltekit/sveltekit-stores)

[Sveltekit stores](https://kit.svelte.dev/docs/modules#$app-stores) are:
- [page](https://kit.svelte.dev/docs/modules#$app-stores-page): page data
- [navigating](https://kit.svelte.dev/docs/modules#$app-stores-navigating) : stores where navigation was triggered from and where navigation is going to
- [updated](https://kit.svelte.dev/docs/modules#$app-stores-updated): Boolean store that checks for updated versions of the app
- [getStores](https://kit.svelte.dev/docs/modules#$app-stores-getstores): a function to get the stores

```javascript
function getStores(): {
    page: typeof page;

    navigating: typeof navigating;

    updated: typeof updated;
};
```


Console.log to see that's there:

```javascript
<script>
	import { navigating, page, updated, getStores } from '$app/stores';
	$: console.log('navigating', $navigating);
	$: console.log('updated', $updated);
	$: console.log('page', $page);

</script>

```

->

```
navigating null

updated false

page
{error: null,
 params: {…},
  route: {…},
  status: 200,
  url: URL, …}
data : {all_episodes: Array(636), latest_episode: {…}}
error: null
form: null
params: {}
route: {id: '/'}
status: 200
url: URL {origin: 'http://127.0.0.1:5173', protocol: 'http:', username: '', password: '', host: '127.0.0.1:5173', …}
[[Prototype]] : Object
```

So, navigating is `null` and updated is `false` to start, as expected.
Page contains all kinds of goodies, including:
- route and pathname
- params
- data! **Literally the data loaded in the site** This means you don't need to pass props between components, you can simpyly access `$page.data`

After clicking a page, navigating becomes populated with `from` and `to` props, continaing `params`, `route`, `url`. This could be useful eg for a loading page.

### Show a loading indicator whenever page changes
1. Head to `src/routes/+layout.svelte` and subscribe to navigating.
2. Add and if clause to show a div with loading message if navigating is truthy:

```javascript
<script>
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';
	import './styles.css';
	import Episodes from './Episodes.svelte';
    import { navigating } from '$app/stores';

	export let data;
	$: ({ all_episodes } = data);
</script>

<Header />

{#if $navigating}
    <div class="loading">Loading...</div>
{/if}

<!-- all the rest -->

<style>
  .loading {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2em;
    }
</style>
```
