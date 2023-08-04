---
title: Making a portal
date: '2023-08-03'
description: Making a portal
tags:
  - levelup
  - sveltekit
  - components
---
#[Making a portal](https://levelup.video/tutorials/building-svelte-components/making-a-portal)

A [portal is an HTML element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/portal) that enables the embedding of another HTML page into the current one for the purposes of allowing smoother navigation into new pages.

1. Create ```src/lib/Portal.svelte```
2. Set up [svelte action](https://svelte.dev/docs/svelte-action) scaffold:

```
<!-- script -->
<script>
	function portal(node) {
        let target;

        function update() {

        }

        function destroy() {

        }

        update();

		return {
			update,
			destroy
		};
	}
</script>

<!-- html -->

<div use:portal />
```

Functions ```update``` and ```destroy``` are svelte action lifecycle methods usually defined in the return statement. Here, they are called in the return but defined in the body so that we can call them in the body as well without duplication.

2. Use [document.querySelector](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector) to select the [body](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/body), and append [node](https://developer.mozilla.org/en-US/docs/Web/API/Node) to that target.

```
function portal(node) {
        let target = document.querySelector('body');
        target?.appendChild(node);
        ...
```

3. Write destroy function that checks if a node has a parent, and if so removes itself:

```
function destroy() {
    // if child has a parent (ie, exists), remove it
    if (node.parentNode) {
        node.parentNode.removeChild(node);
    }
 }
```

4. Add markdown to use the portal function below the script element

```
<div use:portal>
	<slot />
</div>

```

5. Use it in ```+page.svelte```:

```
<script>
	import Portal from '$lib/Portal.svelte';
	import Markdown from '$lib/Markdown.svelte';
</script>

<Portal>
	<Markdown bind:text />
</Portal>
```

This appears at the bottom of the page in a distinct DOM tree, as it has been appended directly as a child of ```body```:

```html
<body data-sveltekit-preload-data="hover" cz-shortcut-listen="true">
<!-- main page -->
    <div style="display: contents">
        <h1 class="s-y_bCXRrkrYfP">Welcome to Level UI</h1>
       <!--...-->
   >/div>

<!-- Portal -->
	<div>
        <div class="markdownContainer s--1LSgD-lfx9T"></div>
    </div>
</body>
```

6. There is a quick flash of the portal content not being there before it loads. So, initially hide it using [hidden, a browser API that indicates that the element is not yet, or is no longer, relevant](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/hidden), and then display via JS:

```
<!-- script -->
<script>
	function portal(node) {
		let target;

		function update() {
			target = document.querySelector('body');
			target?.appendChild(node);
            // remove hidden
            node.hidden = false;
		}

		function destroy() {
			// if child has a parent (ie, exists), remove it
			if (node.parentNode) {
				node.parentNode.removeChild(node);
			}
		}

		update();

		return {
			update,
			destroy
		};
	}
</script>

<div use:portal hidden>
	<slot />
</div>
```

7. Can be made configurable, for example by allowing target to be passed in via prop:

```<Portal target='body'>```

```
function portal(node, element) {

	function update() {
	    let target;
		target = document.querySelector(element);
```
