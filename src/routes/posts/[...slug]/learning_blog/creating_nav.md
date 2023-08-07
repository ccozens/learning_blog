---
title: Creaing a nav component
description: Setting up a nav component for the blog that auto-generates links to routes.
date: 2021-08-07
tags:
    - learning_blog
    - sveltekit
    - nav
    - components
---

## Creating a nav component

This nav component generates links to routes from the folder structure, meaning there is no need to manually update the nav when a new route is added.

### Files edited

-   `src/lib/components/Nav.svelte`
-   `src/lib/functions/GetAllPaths.ts`
-   `src/lib/types/Nav.ts` + `src/lib/types/index.ts`
-   `src/routes/+layout.svelte`
-   `src/routes/tags/+page.server.ts`

### File by file

#### Nav.svelte

```svelte
<script lang="ts">
	import { page } from '$app/stores';
	import type { NavItem } from '$lib/types';

	export let navItems: NavItem[] = [];
	$: currentPath = $page.route.id;
	$: activePath = currentPath === '/posts/tags' ? '/tags' : currentPath;
</script>

<nav>
	<ul class="navItems">
		{#each navItems as navItem}
			<li class="navItem" class:active={activePath !== '/' && activePath === navItem.path}>
				<a href={navItem.path}> {navItem.name}</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.navItems {
		margin-bottom: 2rem;
		padding: 0;
		list-style: none;
	}
	.navItem {
		display: inline-block;
		margin-right: 1rem;
		cursor: pointer;
	}
	.active {
		background-color: yellow;
	}
</style>
```

-   This file accepts custom navItems, which are an array of objects with a name and path. It then loops through the navItems and creates a link for each one. It also adds a class of active to the link if the current path is the same as the link path.
-   The styling is basic for now but not `.active`, which is added to the link if the current path is the same as the link path: `<li class="navItem" class:active={activePath !== '/' && activePath === navItem.path}>`.
-   the path is updated to be `/tags` if the current path is `/posts/tags`: `$: activePath = currentPath === '/posts/tags' ? '/tags' : currentPath;`, as `/tags` doesn't exist as a route (see `tags/+page.server.ts` below).

#### GetAllPaths.ts

```ts
import type { NavItem } from '$lib/types';

export async function getAllPaths(): Promise<NavItem[]> {
	// return all paths with .svelte files in
	const modules = import.meta.glob('/src/routes/**/*.svelte');
	const rawPaths: string[] = [];

	for (const path in modules) {
		// skip item if does not contain +page
		if (!path.includes('+page')) continue;
		// skip item if contains [
		if (path.includes('[')) continue;
		// split path into array
		const formattedPath = path.split('/');
		// get second to last item in array
		const item = formattedPath.at(-2);
		// check for item
		if (!item) continue;
		// add path to array,
		rawPaths.push(item);
	}

	const navItems: NavItem[] = rawPaths.map((navItem) => ({
		name: navItem,
		path: '/' + navItem
	}));

	// update first entry to be home
	navItems[0] = { name: 'Home', path: '/' };
	// capitalise first letter of each item
	navItems.forEach((navItem) => {
		navItem.name = navItem.name.charAt(0).toUpperCase() + navItem.name.slice(1);
	});
	return navItems;
}
```

This file:

-   Imports the NavItem type
-   reads the directory structure of the routes folder
-   loops through the paths and adds them to an array. The loop:
    -   skips any folders that don't contain `+page` or do contain `[`
    -   splits the path into an array at `/`: `const formattedPath = path.split('/');`
    -   keeps the last but one item in the array: `const item = formattedPath.at(-2);`, so `/posts/tags/+page.svelte` becomes `tags`
    -   adds to an array
-   creates an array of NavItems from the array of paths:
    ```ts
    const navItems: NavItem[] = rawPaths.map((navItem) => ({
    	name: navItem,
    	path: '/' + navItem
    }));
    ```
-   updates the first entry to be home: `navItems[0] = { name: 'Home', path: '/' };`
-   modifies each to have first letter uppercase: `navItems.forEach((navItem) => { navItem.name = navItem.name.charAt(0).toUpperCase() + navItem.name.slice(1); });`

#### types

Create new type for navItem

```ts:navItem.ts
export interface NavItem {
	name: string;
	path: string;
}
```

and modify index for uniform exports

```ts:index.ts
// navItem
export * from './navItem';
```

#### +layout.svelte

```svelte
<script lang="ts">
	import Nav from '$lib/components/Nav.svelte';

	// load path data for nav
	export let data;
	const navItems = data.navItems;
</script>

<header>
	<Nav {navItems} />
</header>
```

This only shows updates the header to include the nav component, passing in the navItems data.

#### tags/+page.server.ts

```ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// redirect to /posts/tag
	throw redirect(307, '/posts/tags');
};
```

This is a [svelte redirect](https://kit.svelte.dev/docs/load#redirects) and is necessary because I put the tags page in a subfolder of posts. This means that the nav component will try to link to `/tags`, which doesn't exist. This file redirects to `/posts/tags` instead.
