---
title: 'sveltekit intro'
date: '2023-07-03'
description: description
tags:
  - levelup
  - sveltekit
---

Server-side rendered by default

## Create a route
1. Create new folder in ```/src/routes```
2. Create ```+page.svelte``` and done

## Layouts
Sveltekit has the idea of a decorated file, like ```+``` before page. This shows it is a special file type.
Layouts wrap around any page from the route it is declared in further down. It needs ```<slot />```, which tells svelte where to load the (or slot in!) the children.

For example, for universal head and footer

1. Create layout: ```code src/routes/+layout.svelte```
2. Code:

```svelte
<header>
	<h1>My App</h1>
</header>

<main>
	<slot />
</main>

<footer>
	<p>Made with svelte</p>
</footer>
```

For a nested layout:
1. Create file: ```code src/routes/about/+layout.svelte```
2. Code:

```svelte
<h4>About layout</h4>

<a href="/">Home</a>
```



## Componentize header
Split header out into component
1. create ```code src/routes/Header.svelte``` - Header.svelte created directeld in routes dir
2. cut and paste header code from +layout.svelve:

```svelte
<header>
	<h1>My App</h1>
</header>
```

4. In +layout.svelte:

```svelte
<script>
    import Header from './Header.svelte';
</script>

<Header />

<main>
	<slot />
</main>
```

And same for footer.
