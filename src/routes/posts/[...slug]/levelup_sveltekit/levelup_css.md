---
title: 'CSS in sveltekit'
date: '2023-07-03'
description: description
tags:
  - levelup
  - sveltekit
  - css
---
There are two recommended ways to add CSS in svelte:

1. Scoped CSS, added directly to HTML:

eg  ```+Header.svelte```:

```svelte
<header>
	<h1>My App</h1>
</header>

<style>
	header {
		background: #333;
		color: #fff;
		padding: 1em;
    }

    h1 {
        font-size: 1.5em;
    }
</style>
```

This is the recommended approach to scope styles to a particular component. Note there is no class defined - svelte will generate a class consisting random characters, scoping to the component.

2. Global CSS, created in files and imported:

	1. Create ```code src/routes/styles.css```
	2. In layout.svelte's script tag: ```import styles.css```
	3. If this was imported in ```about/layout.svelte```, the css would only apply to the about page and child pages
