---
title: Sveltekit Navigation module
date: '2023-07-07'
description: Intro to sveletekit navigation module
tags:
  - levelup
  - sveltekit
  - nav
---
## [Navigation module video](https://levelup.video/tutorials/sveltekit/app-navigation)

This is another [svelteKit module](https://kit.svelte.dev/docs/modules#$app-navigation).

It includes some lifecyle methods:
- [afterNavigate](https://kit.svelte.dev/docs/modules#$app-navigation-afternavigate), [beforeNavigate](https://kit.svelte.dev/docs/modules#$app-navigation-beforenavigate), -> exist in case want to fire event before or after page navigation

- [disableScrollHandling](https://kit.svelte.dev/docs/modules#$app-navigation-disablescrollhandling) -> disables svelteKit's default scroll handling (by default, a new page is scrolled to the top)

- [goto](https://kit.svelte.dev/docs/modules#$app-navigation-goto) -> for programattic routing, functions like an anchor tag. eg they use at LevelUp for routing after an API call - after successful login, send user to their dashboard. It takes options, eg you can call [invalidateAll](https://kit.svelte.dev/docs/modules#$app-navigation-invalidateall) before ```goto```.

- [invalidate](https://kit.svelte.dev/docs/modules#$app-navigation-invalidate) -> causes load functions on active page rerun

- [invalidateAll](https://kit.svelte.dev/docs/modules#$app-navigation-invalidateall) -> causes all load functions to rerun. This is usually more useful.

- [preloadCode](https://kit.svelte.dev/docs/modules#$app-navigation-preloadcode) -> imports the code for routes that haven't yet been fetched. Typically, you might call this to speed up subsequent navigation.

- [preloadData](https://kit.svelte.dev/docs/modules#$app-navigation-preloaddata) -> as preloadCode and also calls the page's load function to load data.
