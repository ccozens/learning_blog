---
title: DOM Element Reference
date: '2023-08-03'
description: typing DOM elements in sveltekit
tags:
  - levelup
  - sveltekit
  - typescript
---
## [video](https://levelup.video/tutorials/svelte-and-typescript/html-element-reference)

You can access HTML elements (ie DOM nodes) really easily in svelte and SK by [binding](https://svelte.dev/docs/element-directives#bind-this). From the docs:

```svelte
<script lang="ts">
  import { onMount } from 'svelte';

  let canvasElement: HTMLCanvasElement;

  onMount(() => {
    const ctx = canvasElement.getContext('2d');
    drawStuff(ctx);
  });
</script>

<canvas bind:this={canvasElement} />
```

1. In ```Header.svelte```

```
<script lang="ts">
	// create reference
	let header_element;
	// log it
	$: console.log(header_element);
</script>

// bind:this to bind element to reference
<header bind:this={header_element}>
	<h1><a href="/">Syntax Podcast</a></h1>
</header>
```

This logs 2 lines:
_undefined_ -> makes sense as logs before template loads
_Header.svelte:10 <header class=​"s-Cmt25qOMERl7">​…​</header>​flex_ -> logs info on header element!

2. Types!

Update: ```	let header_element: HTMLElement | undefined```;

_undefined_ as it will be undefined on first load.

The only time you need anything other than HTMLElement is forms or inputs, when you'll need eg HTMLInput.
