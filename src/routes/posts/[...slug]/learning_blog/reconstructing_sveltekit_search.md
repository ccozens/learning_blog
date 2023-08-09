---
title: Reconstructing sveltekit.dev's search
description: Learning by copying - a deep dive into the search functionality of sveltekit.dev
date: 2023-08-09
tags:
    - learning
    - sveltekit
    - search
    - keyboard
    - stores
---

I'm a big fan of how the search function in [sveltekit.dev](sveltekit.dev) works. It's fast, it's keyboard accessible, and it's easy to use. I wanted to learn how it works, so I decided to deconstruct it. The code is available on [GitHub](https://github.com/sveltejs/site-kit/tree/master/packages/site-kit/src/lib/search), though svelte make a point of saying the [site-kit repo](https://github.com/sveltejs/site-kit) is a collection of components for their use, not a component library.

## The files

The search folder contains 8 files, 4 of which are Svelte components, 2 are JavaScript functions and finally an index file and a types file. Between them they import a store and an action, making 10 files in total. These are:

```bash
└── src
    └── lib
        └── actions
        │    └── focus.js
        └── search
        │   ├── index.js
        │   ├── Search.svelte
        │   ├── SearchBox.svelte
        │   ├── SearchResultList.svelte
        │   ├── SearchResults.svelte
        │   ├── search-worker.js
        │   ├── search.js
        │   └── types.js
        └── stores
            └── search.js

```

### The store

```javascript:search.js
import { persisted } from 'svelte-local-storage-store';
import { writable } from 'svelte/store';

export const searching = writable(false);
export const search_query = writable('');
export const search_recent = persisted('svelte:recent-searches', []);
```

This files contains three stores:

1. `searching` - a boolean to indicate if the search is in progress. This is a simple [writable store](https://svelte.dev/docs/svelte-store#writable).
2. `search_query` - a string to hold the search query. This is also a simple [writable store](https://svelte.dev/docs/svelte-store#writable).
3. `search_recent` is another [writable store](https://svelte.dev/docs/svelte-store#writable), this time with a wrapper from [svelte-local-storage-store](https://github.com/joshnuss/svelte-local-storage-store), which enables the store to be persisted to local storage, in this case with the key `svelte:recent-searches`.

### The action

```javascript:focus.js
/** @param {HTMLElement} node */
export function focusable_children(node) {
	const nodes = Array.from(
		node.querySelectorAll(
			'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
		)
	);

	const index = nodes.indexOf(document.activeElement);

	const update = (d) => {
		let i = index + d;
		i += nodes.length;
		i %= nodes.length;

		// @ts-expect-error
		nodes[i].focus();
	};

	return {
		/** @param {string} [selector] */
		next: (selector) => {
			const reordered = [...nodes.slice(index + 1), ...nodes.slice(0, index + 1)];

			for (let i = 0; i < reordered.length; i += 1) {
				if (!selector || reordered[i].matches(selector)) {
					reordered[i].focus();
					return;
				}
			}
		},
		/** @param {string} [selector] */
		prev: (selector) => {
			const reordered = [...nodes.slice(index + 1), ...nodes.slice(0, index + 1)];

			for (let i = reordered.length - 2; i >= 0; i -= 1) {
				if (!selector || reordered[i].matches(selector)) {
					reordered[i].focus();
					return;
				}
			}
		},
		update
	};
}

/**
 * @param {HTMLElement} node
 * @param {{ reset_focus?: boolean }} opts
 */
export function trap(node, { reset_focus = true } = {}) {
	const previous = /** @type HTMLElement} */ (document.activeElement);

	const handle_keydown = (e) => {
		if (e.key === 'Tab') {
			e.preventDefault();

			const group = focusable_children(node);
			if (e.shiftKey) {
				group.prev();
			} else {
				group.next();
			}
		}
	};

	node.addEventListener('keydown', handle_keydown);

	return {
		destroy: () => {
			node.removeEventListener('keydown', handle_keydown);
			if (reset_focus) {
				previous?.focus({ preventScroll: true });
			}
		}
	};
}
```

This file contains two functions, `focusable_children` and `trap`.

#### focusable_children()

_focusable_children()_ is an [action](https://svelte.dev/docs#use_action) that takes a node and returns an object with three methods:

1. `next()` - moves focus to the next focusable element in the node.
2. `prev()` - moves focus to the previous focusable element in the node.
3. `update()` - updates the index of the current focusable element.

##### Generating an array of nodes

The first thing the function does is generate an array of focusable elements in the node. It does this by using the `querySelectorAll()` method on the node, passing it a string that is a comma separated list of selectors.

```javascript
const nodes = Array.from(
	node.querySelectorAll(
		'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
	)
);
```

Where `node` is the node passed to the function. The selectors are:

1. `a[href]` - all anchor elements with an href attribute.
2. `button` - all button elements.
3. `input` - all input elements.
4. `textarea` - all textarea elements.
5. `select` - all select elements.
6. `details` - all details elements.
7. `[tabindex]:not([tabindex="-1"])` - all elements with a tabindex attribute that is not -1. [According to MDN, tabindex="-1"](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex) means that the element is focusable but not reachable via sequential keyboard navigation.

##### Getting the index of the current focusable element

The next thing the function does is get the index of the current focusable element. It does this by using the `indexOf()` method on the array of nodes, passing it the `document.activeElement` property.

```javascript
const index = nodes.indexOf(document.activeElement);
```

[indexOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf) is a JS array method that rturns the first index at which a given element can be found in the array, or -1 if it is not present.

##### update function

The update is an optional method that can be defined in a [svelte action](https://svelte.dev/docs/svelte-action), and is called immediately after Svelte has applied updates to the markup whenever that parameter changes.

Here, the update function is:

```javascript
const update = (d) => {
	let i = index + d;
	i += nodes.length;
	i %= nodes.length;
};
```

It takes in parameter _d_, and determines both the direction of travel and the next focusable element. It took me a while to get this, so: - `let i = index + d` - _index_ is the current index of the active element within the array of nodes. - _d_ is the direction of travel, either 1 or -1. - So, _index + d_ calculates the next index to focus on.

-   `i += nodes.length;` - handles wrapping around the end of the list of nodes by ensuring the calculated index is always within the bounds of the _nodes_ array. Specifically, if the calculated index is less than 0, it adds the length of the _nodes_ array to the calculated index to loop to the end of the array. -`i %= nodes.length;` - [modulo operation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder) ensures the calculated index wraps if it exceeds the length of the _nodes_ array, because modulo returns the remainder from a division.

In short, update() takes a direction and updates the index of the current focusable element.

#### next() and prev() methods

Similar ideas but in opposite directions!

```javascript
next: (selector) => {
			const reordered = [...nodes.slice(index + 1), ...nodes.slice(0, index + 1)];

			for (let i = 0; i < reordered.length; i += 1) {
				if (!selector || reordered[i].matches(selector)) {
					reordered[i].focus();
					return;
				}
			}
		},
```

The next() method takes an optional selector parameter, and:

-   `const reordered = [...nodes.slice(index + 1), ...nodes.slice(0, index + 1)];` Creates a new array, reordered, that is a copy of the nodes array, but with the elements reordered so that the element that currently has focus is at the start of the array.
-   Loops through the reordered array, and if the element matches the selector, it is focused on and the loop is broken.
-   `if (!selector || reordered[i].matches(selector)) {reordered[i].focus(); return;}`
    If no element matches the selector, the loop ends and nothing happens.

```javascript
prev: (selector) => {
			const reordered = [...nodes.slice(index + 1), ...nodes.slice(0, index + 1)];

			for (let i = reordered.length - 2; i >= 0; i -= 1) {
				if (!selector || reordered[i].matches(selector)) {
					reordered[i].focus();
					return;
				}
			}
		},
```

The prev() method is similar, but:

-   The loop ends at the second to last element in the array (`let i = reordered.length - 2`), because the last element is the element that currently has focus.
-   The loop works backwards (`i -= 1`).

#### trap()

_trap()_ is a [svelte action](https://svelte.dev/docs#use_action) that enables keyboard navigation within a node, using either tab or shift+tab.

-   _node_ is the node passed to the function, and _reset_focus_ is a boolean that determines whether focus is returned to the previous element when the trap is destroyed.

-   `const previous = /** @type HTMLElement} */ (document.activeElement);` gets the current active element, and casts it as an HTMLElement.

-   the handle_keydown function handles the keydown event, and if the key pressed is tab, it prevents the default behaviour and calls the next() or prev() method on the group of focusable elements, depending on whether shift is pressed.

```javascript
const handle_keydown = (e) => {
	if (e.key === 'Tab') {
		e.preventDefault();

		const group = focusable_children(node);
		if (e.shiftKey) {
			group.prev();
		} else {
			group.next();
		}
	}
};
```

-   `node.addEventListener('keydown', handle_keydown);` adds the event listener to the node.
-   The destoy function is triggered when the component is destroyed, and removes the event listener.
    -   `node.removeEventListener('keydown', handle_keydown` removes the event listener.
    -   `if (reset_focus) {previous?.focus({ preventScroll: true });};` returns focus to the previous element if _reset_focus_ is true, and prevents scrolling using _preventScroll: true_.

[preventScroll is an optional parameter of the HTML focus() method](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus), and is a boolean that determines whether the browser should scroll the element into view if it is not already visible.
