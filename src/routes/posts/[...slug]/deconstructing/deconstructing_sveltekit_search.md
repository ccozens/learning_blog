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

<!-- svelte-ignore A11y: <a> element should have child content -->

-   [1. Overview](#1-overview)
-   [2. What is it?](#2-what-is-it)
-   [3. The files](#3-the-files)
    -   [3.1. The stores](#31-the-stores)
        -   [3.1.1. nav.js](#311-navjs)
        -   [3.1.2. search.js](#312-searchjs)
    -   [3.2. The actions](#32-the-actions)
        -   [3.2.1. focusable_children()](#321-focusable_children)
            -   [Generating an array of nodes](#generating-an-array-of-nodes)
            -   [Getting the index of the current focusable element](#getting-the-index-of-the-current-focusable-element)
            -   [update function](#update-function)
        -   [3.2.2. next() and prev() methods](#322-next-and-prev-methods)
        -   [3.2.3. trap()](#323-trap)
    -   [3.3. Javascript files](#33-javascript-files)
        -   [3.3.1. search.js](#331-searchjs)
        -   [3.3.2. Flexsearch](#332-flexsearch)
            -   [Indexes](#indexes)
        -   [3.3.3. Search function](#333-search-function)
            -   [init function](#init-function)
            -   [search function](#search-function)
            -   [tree function](#tree-function)
        -   [3.3.4. search-worker.js](#334-search-workerjs)
        -   [3.3.5. Web workers](#335-web-workers)
        -   [3.3.6. Breakdown](#336-breakdown)
    -   [3.4. The search components](#34-the-search-components)
        -   [3.4.1. index](#341-index)
        -   [3.4.2. Search.svelte](#342-searchsvelte)
            -   [Browser](#browser)
            -   [3.4.3. Imports and props](#343-imports-and-props)
            -   [3.4.4. Search form](#344-search-form)
            -   [Input](#input)
            -   [Shortcut](#shortcut)
        -   [3.4.3. SearchBox.svelte](#343-searchboxsvelte)
            -   [Imports](#imports)
            -   [onMount](#onmount)
            -   [afterNavigate](#afternavigate)
            -   [navigate function](#navigate-function)
            -   [Sending messages to SearchWorker](#sending-messages-to-searchworker)
            -   [Managing the overlay](#managing-the-overlay)
            -   [Managing the modal](#managing-the-modal)
            -   [Resetting the search query](#resetting-the-search-query)
            -   [Rendering](#rendering)
                -   [Adding an event listener to window](#adding-an-event-listener-to-window)
                -   [Showing the modal](#showing-the-modal)
        -   [3.4.4. SearchResultList.svelte](#344-searchresultlistsvelte)
            -   [Custom event](#custom-event)
            -   [Props](#props)
            -   [escape function](#escape-function)
            -   [excerpt function](#excerpt-function)
            -   [HTML](#html)
        -   [3.4.5. SearchResults.svelte](#345-searchresultssvelte)
    -   [types.d.ts](#typesdts)

## 1. <a name='Overview'></a>Overview

I'm a big fan of how the search function in [sveltekit.dev](sveltekit.dev) works. It's fast, it's keyboard accessible, and it's easy to use. I wanted to learn how it works, so I decided to deconstruct it. The code is available on [GitHub](https://github.com/sveltejs/site-kit/tree/master/packages/site-kit/src/lib/search), though svelte make a point of saying the [site-kit repo](https://github.com/sveltejs/site-kit) is a collection of components for their use, not a component library.

## 2. <a name='Whatisit'></a>What is it?

The sveltekit search component is accessed via a search box in the website header or keyboard command. It opens a modal that uses [flexsearch](https://github.com/nextapps-de/flexsearch) to search the site's content. The search results are displayed in a list, which can be navigated with the keyboard. The search box is focused when the modal opens, and the search query is cleared when the modal closes.

## 3. <a name='Thefiles'></a>The files

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
        │   └── types.d.ts
        └── stores
			├── nav.js
            └── search.js

```

The code is all in [JSDoc format](https://jsdoc.app/), which is compatible with JavaScript and TypeScript, and provides type safety without the overhead of TypeScript. This is a good intro to [JSDoc from Prisma](https://www.prisma.io/blog/type-safe-js-with-jsdoc-typeSaf3js).

### 3.1. <a name='Thestores'></a>The stores

Note there is also an `index.js` file to simplify imports from the stores.

#### 3.1.1. <a name='nav.js'></a>nav.js

```javascript:nav.js
import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export const should_nav_autohide = writable(false);
export const nav_open = writable(false);

// Secondarily related to bav
export const overlay_open = writable(false);
export const on_this_page_open = writable(false);

overlay_open.subscribe((value) => {
	if (!browser) return;

	if (value) {
		// Disable root from scrolling
		document.documentElement.style.overflow = 'hidden';
	} else {
		// Enable root to scroll
		document.documentElement.style.overflow = '';
	}
});
```

This file contains four stores, all of whh are simple [writable stores](https://svelte.dev/docs/svelte-store#writable) with default value `false`.
It also contains logic that disables scrolling on the root element when the `overlay_open` store is set to `true`. `overlay_open.subscribe((value) => {` listens to changes in _overlay_open_'s value and, if set to _true_, disables scrolling on the root element by setting overflow to _hidden_. If _overlay_open_ emits a falsy value, the if statement will not execute and the overflow property of the _document.documentElement_ element will be set to an empty string, which enables scrolling on the root element of the document.

#### 3.1.2. <a name='search.js'></a>search.js

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

### 3.2. <a name='Theactions'></a>The actions

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

#### 3.2.1. <a name='focusable_children'></a>focusable_children()

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

[indexOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf) is a JS array method that returns the first index at which a given element can be found in the array, or -1 if it is not present.

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

#### 3.2.2. <a name='nextandprevmethods'></a>next() and prev() methods

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

#### 3.2.3. <a name='trap'></a>trap()

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
-   The destroy function is triggered when the component is destroyed, and removes the event listener.
    -   `node.removeEventListener('keydown', handle_keydown` removes the event listener.
    -   `if (reset_focus) {previous?.focus({ preventScroll: true });};` returns focus to the previous element if _reset_focus_ is true, and prevents scrolling using _preventScroll: true_.

[preventScroll is an optional parameter of the HTML focus() method](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus), and is a boolean that determines whether the browser should scroll the element into view if it is not already visible.

### 3.3. <a name='Javascriptfiles'></a>Javascript files

#### 3.3.1. <a name='search.js-1'></a>search.js

```javascript:search.js
import flexsearch from 'flexsearch';

// @ts-expect-error
const Index = /** @type {import('flexsearch').Index} */ (flexsearch.Index) ?? flexsearch;

/** If the search is already initialized */
export let inited = false;

/** @type {import('flexsearch').Index<any>[]} */
let indexes;

/** @type {Map<string, import('./types').Block>} */
const map = new Map();

/** @type {Map<string, string>} */
const hrefs = new Map();

/**
 * Initialize the search index
 * @param {import('./types').Block[]} blocks
 */
export function init(blocks) {
	if (inited) return;

	// we have multiple indexes, so we can rank sections (migration guide comes last)
	const max_rank = Math.max(...blocks.map((block) => block.rank ?? 0));

	indexes = Array.from({ length: max_rank + 1 }, () => new Index({ tokenize: 'forward' }));

	for (const block of blocks) {
		const title = block.breadcrumbs.at(-1);
		map.set(block.href, block);
		// NOTE: we're not using a number as the ID here, but it is recommended:
		// https://github.com/nextapps-de/flexsearch#use-numeric-ids
		// If we were to switch to a number we would need a second map from ID to block
		// We need to keep the existing one to allow looking up recent searches by URL even if docs change
		// It's unclear how much browsers do string interning and how this might affect memory
		// We'd probably want to test both implementations across browsers if memory usage becomes an issue
		// TODO: fix the type by updating flexsearch after
		// https://github.com/nextapps-de/flexsearch/pull/364 is merged and released
		indexes[block.rank ?? 0].add(block.href, `${title} ${block.content}`);

		hrefs.set(block.breadcrumbs.join('::'), block.href);
	}

	inited = true;
}

/**
 * Search for a given query in the existing index
 * @param {string} query
 * @returns {import('./types').Tree[]}
 */
export function search(query) {
	const escaped = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
	const regex = new RegExp(`(^|\\b)${escaped}`, 'i');

	const blocks = indexes
		.flatMap((index) => index.search(query))
		.map(lookup)
		.map((block, rank) => ({ block: /** @type{import('./types').Block} */ (block), rank }))
		.sort((a, b) => {
			const a_title_matches = regex.test(/** @type {string} */ (a.block.breadcrumbs.at(-1)));
			const b_title_matches = regex.test(/** @type {string} */ (b.block.breadcrumbs.at(-1)));

			// massage the order a bit, so that title matches
			// are given higher priority
			if (a_title_matches !== b_title_matches) {
				return a_title_matches ? -1 : 1;
			}

			return a.block.breadcrumbs.length - b.block.breadcrumbs.length || a.rank - b.rank;
		})
		.map(({ block }) => block);

	const results = tree([], blocks).children;

	return results;
}

/**
 * Get a block with details by its href
 * @param {string} href
 */
export function lookup(href) {
	return map.get(href);
}

/**
 * @param {string[]} breadcrumbs
 * @param {import('./types').Block[]} blocks
 * @returns {import('./types').Tree}
 */
function tree(breadcrumbs, blocks) {
	const depth = breadcrumbs.length;

	const node = blocks.find((block) => {
		if (block.breadcrumbs.length !== depth) return false;
		return breadcrumbs.every((part, i) => block.breadcrumbs[i] === part);
	});

	const descendants = blocks.filter((block) => {
		if (block.breadcrumbs.length <= depth) return false;
		return breadcrumbs.every((part, i) => block.breadcrumbs[i] === part);
	});

	const child_parts = Array.from(new Set(descendants.map((block) => block.breadcrumbs[depth])));

	return {
		breadcrumbs,
		href: /** @type {string} */ (hrefs.get(breadcrumbs.join('::'))),
		node: /** @type {import('./types').Block} */ (node),
		children: child_parts.map((part) => tree([...breadcrumbs, part], descendants))
	};
}
```

#### 3.3.2. <a name='Flexsearch'></a>Flexsearch

_search.js_ imports and sets up the flexsearch function. [Flexsearch]()https://github.com/nextapps-de/flexsearch is the fastest JS searching library and provides flexible search capabilities like multi-field search, phonetic transformations or partial matching. [Performance benchmarks](https://github.com/nextapps-de/flexsearch#performance-benchmark-ranking) are provided to back this up.

##### Indexes

Flexsearch provides [3 types of indexes](https://github.com/nextapps-de/flexsearch#load-library), of which the docs advise you'll likely only need one:

1. Index is a flat high performance index which stores id-content-pairs.
2. Worker / WorkerIndex is also a flat index which stores id-content-pairs but runs in background as a dedicated worker thread.
3. Document is multi-field index which can store complex JSON documents (could also exist of worker indexes).

_Index_ has the following basic methods:

-   [index.add(id, string);]()https://github.com/nextapps-de/flexsearch#index.add) -> adds a new entry to the index, with unique ID>
-   [index.append(id, string)](https://github.com/nextapps-de/flexsearch#append-contents) -> appends a new entry to the index, with unique ID. This differs from add in that it won't overwrite existing entries, and
-   [index.update(id, string)](https://github.com/nextapps-de/flexsearch#update-item-from-an-index) -> overwrites extant content with new content.
-   [index.remove(id)](https://github.com/nextapps-de/flexsearch#remove-item-from-an-index) -> removes an entry from the index.
-   [index.search(string, <limit>, <options>)](https://github.com/nextapps-de/flexsearch#search-items) -> used for searching!.
    -   basic search: `index.search("John");`
    -   search limiting to 10 results: `index.search("John", 10);`
-   [index.search(options)](https://github.com/nextapps-de/flexsearch#search-options) -> define how search is carried out, e.g. `index.search({ query: "John", limit: 10, suggest: true });` enables suggestions in results
-   [index.export(key, data)](https://github.com/nextapps-de/flexsearch#export) -> export data
-   [index.import(key, data)](https://github.com/nextapps-de/flexsearch#import) -> import data. Note you ned to create an index before can import data into it.
    Each method can also been called as an [async method](https://github.com/nextapps-de/flexsearch#async), e.g. `index.addAsync(id, content, function(){}` by passing a callback, returning a Promise or using async/await.

There are further options, for example using a [built-in tokenizer](https://github.com/nextapps-de/flexsearch#tokenizer-prefix-search) or [defining a custom tokenizer](https://github.com/nextapps-de/flexsearch#add-custom-tokenizer): `var index = new FlexSearch({ tokenize: function(str) { return str.split(/\s-\//g); } });` , which takes a string and returns an array of strings, and [encoders](https://github.com/nextapps-de/flexsearch#encoders), which affect memory requirement, query time and phonetic matches.

#### 3.3.3. <a name='Searchfunction'></a>Search function

-   This search function uses _index_: `const Index = /** @type {import('flexsearch').Index} */ (flexsearch.Index) ?? flexsearch;`.
-   `export let inited = false;` creates _inited_ to check whether a search has been initialized:
-   `export let indexes = [];` creates _indexes_ to store the search indexes.
-   `export const map = new Map();` creates _map_ to store the search map.
-   `export const hrefs = new Map();` creates _hrefs_ to store the search hrefs.

##### init function

-   `export function init(blocks) {if (inited) return;` creates _init_ to initialize the search, and aborts if _inited_ is _true_.
-   the next 2 lines create an index array and generate a new index that incrementally indexes words in forward direction: -`const max_rank = Math.max(...blocks.map((block) => block.rank ?? 0));` iterates over the _blocks_ array and extracts _rank_. If not present it defaults to 0, and then uses [Math.max](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max) to find the highest rank. -`indexes = Array.from({ length: max_rank + 1 }, () => new Index({ tokenize: 'forward' }));` creates an array of length _max_rank + 1_ and fills it with new indexes, using the _forward_ tokenizer. The forward tokenizer incrementally indexes words in forward direction., braking down words into partial segments (tokens), allowing matching to partial prefixes during search. eg `"hello"` would be indexed as `"h", "he", "hel", "hell", "hello"`.
-   then a for look loops over the _blocks_ array, and for each block:
    -   _title_ is set to the final entry of _blocks.breadcrumbs_ array, using [array method .at](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at) `const title = block.breadcrumbs.at(-1);`
    -   adds a new entry to _map_ consisting block.href as key and block as value: `map.set(block.href, block);`
    -   adds data to the appropriate FlexSearch index based on the rank of a block: `` indexes[block.rank ?? 0].add(block.href, `${title} ${block.content}`); ``. Specifically:
        -   `indexes[block.rank ?? 0]` looks up the index based on the rank of the block. If no rank is present, it defaults to 0 using the [nullish coalescing operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing) `??`.
        -   that done, `` .add(block.href, `${title} ${block.content}`); `` adds a new entry to the index using flexsearch's [index.add method](https://github.com/nextapps-de/flexsearch#add-text-item-to-an-index), with unique ID _block.href_ and content `${title} ${block.content}`. As noted in the comment in the code, svelte are using the URL as an ID, where a [number type is recommended by flexsearch](https://github.com/nextapps-de/flexsearch#use-numeric-ids) due to memory usage.
        -   `hrefs.set(block.breadcrumbs.join('::'), block.href);` adds a new entry to _hrefs_ consisting of the block's breadcrumbs joined by '::' as key and block.href as value. _hrefs_ is a [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) object, and [Map.set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/set) adds a new key:value pair to the map.
-   finally, `inited = true;` sets _inited_ to _true_.

##### search function

This function searches the indexes for a query, and returns an array of results.

First, a case-insensitive regular expression is created that matches the beginning of a string or word boundary, and escapes special characters in the query:

-   `const escaped = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');` escapes special characters in the query with their escaped form, for example `[` -> `\\[`
-   `` const regex = new RegExp(`(^|\\b)${escaped}`, 'i'); `` creates a new [regular expression object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp) that matches the start of words and is case insensitive.
    -   `(^)` matches the start of a string and `(\\b)` matches a word boundary, so `(^|\\b)` matches the start of a string or a word boundary.
    -   `$escaped` uses the escaped query.
    -   `i` is a flag that makes the regular expression case insensitive.

Next, the indexes are searched for the query:

-   `const blocks = indexes.flatMap((index) => index.search(query));` iterates through indexes and searches each index for the query using [flexsearch's .search method](https://github.com/nextapps-de/flexsearch#search-items), and flattens the results into a single level array using [array method .flatMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap).
-   `.map(lookup)` calls the lookup function:

```javascript
/**
 * Get a block with details by its href
 * @param {string} href
 */
export function lookup(href) {
	return map.get(href);
}
```

    This uses the [Map.get()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/get) method to return a specific element from the map, using the href as key.

-   `.map((block, rank) => ({ block: /** @type{import('./types').Block} */ (block), rank }))` transforms each block into an object containing the block and its rank.
-   `.sort((a, b) => {` initiates sorting of the flattened array using [Array.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort).
    -   `const a_title_matches = regex.test(/** @type {string} */ (a.block.breadcrumbs.at(-1)));` tests whether the regular expression matches the title of the block.
    -   the [RegExp.test method](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test) tests whether the regular expression matches the string, and returns a boolean.
    -   `a.block.breadcrumbs.at(-1)` gets the last element of the breadcrumbs array, which is the title of the block.
-   `const b_title_matches = regex.test(/** @type {string} */ (b.block.breadcrumbs.at(-1)));` as prev, for b.
-   `if (a_title_matches && !b_title_matches) return -1;` gives priority to title matches in sorting
-   `return a.block.breadcrumbs.length - b.block.breadcrumbs.length || a.rank - b.rank;` sorts initially by breadcrumb length, giving higher priority to shorter breadcrumbs, and then by rank, giving priority to lower ranks.
-   Finally, the blocks returns the sorted array of blocks: `.map(({ block }) => block);`

After that, the tree() function is used to generate a [tree](https://www.simplilearn.com/tutorials/data-structure-tutorial/trees-in-data-structure) from the blocks array and the children of each block are returned:

```javascript
const results = tree([], blocks).children;
return results;
```

##### tree function

The tree function constructs a tree from the breadcrumbs and blocks array:

-   `const depth = breadcrumbs.length;` sets the tree depth (distance of given node from root) to the length of the breadcrumbs array.
-   `const node = blocks.find((block) => {return breadcrumbs.every((part, i) => block.breadcrumbs[i] === part); });` sets node to an object in the blocks array that matches the breadcrumbs array.

    -   `blocks.find()` finds the first element in the blocks array that matches the breadcrumbs array using [Array.find()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find).
        -   `breadcrumbs.every((part, i) => block.breadcrumbs[i] === part)` uses [Array.every()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every), to test whether every element in the breadcrumbs array matches the corresponding element in the block's breadcrumbs array. Note that .every() tests whether all elements in a given array pass the provided test, and returns true only if all items in the array pass.
        -   for clarity I skipped a null check `if (block.breadcrumbs.length !== depth) return false;`, which returns false if the block's breadcrumbs array is not the same length as the depth.
    -   next `descendants` calls [.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) on the blocks array and returns a new array containing only blocks whose breadcrumbs array is shorter than or equal to the depth, again ensuring the block's breadcrumbs array matches the depth using [.every()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every).

    ```javascript
    const descendants = blocks.filter((block) => {
    	if (block.breadcrumbs.length <= depth) return false;
    	return breadcrumbs.every((part, i) => block.breadcrumbs[i] === part);
    });
    ```

    -   `const child_parts = Array.from(new Set(descendants.map((block) => block.breadcrumbs[depth])));` creates a new array containing only unique elements from the a certain level of the descendants array, using [Array.from()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from) and [Set()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set), which only stores unique values - `descendants` is the array of blocks whose breadcrumbs array is shorter than or equal to the depth - `map((block) => block.breadcrumbs[depth])` creates a new array containing only the breadcrumbs at the given depth - `new Set()` creates a new Set object, which only stores unique values - `Array.from()` creates a new array from the Set object

-   finally the return object is created, corresponding to the tree type:

```javascript
return {
	breadcrumbs,
	href: /** @type {string} */ (hrefs.get(breadcrumbs.join('::'))),
	node: /** @type {import('./types').Block} */ (node),
	children: child_parts.map((part) => tree([...breadcrumbs, part], descendants))
};
```

Note that child_parts is called recursively to construct child nodes in the tree structure. - `child_parts` is the array of unique breadcrumbs at the given depth - `[...breadcrumbs, part]` creates a new array containing the breadcrumbs at the given depth, and the breadcrumb at the given part - `descendants` is the array of blocks whose breadcrumbs array is shorter than or equal to the depth - `tree([...breadcrumbs, part], descendants)` then calls this recursively to construct child nodes in the tree structure

#### 3.3.4. <a name='search-worker.js'></a>search-worker.js

```javascript:search-worker.js
import { init, search, lookup } from './search.js';

addEventListener('message', async (event) => {
	const { type, payload } = event.data;

	if (type === 'init') {
		// Initialize the search index using the fetched content
		const res = await fetch(`${payload.origin}/content.json`);
		const { blocks } = await res.json();
		init(blocks);

		// Notify the main thread that the worker is ready
		postMessage({ type: 'ready' });
	}

	if (type === 'query') {
		// // Perform a search based on the provided query
		const query = payload;
		const results = search(query);

		// Send the search results back to the main thread
		postMessage({ type: 'results', payload: { results, query } });
	}

	if (type === 'recents') {
		// Send the search results back to the main thread
		const results = payload.map(lookup).filter(Boolean);
		// Send the filtered recent results back to the main thread
		postMessage({ type: 'recents', payload: results });
	}
});
```

This file is used bu SearchBox.svelte to create a [web worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) that handles the search functionality. It listens for messages from the main thread, filters them by type, and responds with messages containing the results of the search.

#### 3.3.5. <a name='Webworkers'></a>Web workers

Web workers are a way to run JavaScript code in the background, without blocking the main thread. They are useful for running expensive operations, such as searching, without blocking the main thread. They are also useful for running code that is not needed immediately, such as code that is only needed when a user clicks a button. They communicate with the main thread via the [Worker interface postMessage() method and the onmessage event handler](https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage).

This code fulfills MDN's definition of a web worker as:

1. Background execution: it executes in the background, separate from the main thread. This enables the worker to perform tasks without affecting the user interface.
2. Interference-free: it can fetch data and process it, without blocking the main thread, and hence without blocking the user interface.
3. Communication: it communicates with the main thread through messages. The main thread posts messages to the worker using the postMessage() method, and the worker responds to messages via the onmessage event handler.
4. Data Isolation: data is passed between the main thread and the worker using messages, and the data is copied rather than shared. This ensures data isolation and prevents direct manipulation of the DOM from the worker.

#### 3.3.6. <a name='Breakdown'></a>Breakdown

-   `import { init, search, lookup } from './search.js';` imports the init, search, and lookup functions from search.js, which are used to initialize the search index, perform a search, and lookup a block by its id, respectively.
-   `addEventListener('message', async (event) => {` adds an event listener to the worker that listens for messages from the main thread, and handles them asynchronously.
-   `const { type, payload } = event.data;` extracts the type and payload from the message data.
-   `if (type === 'init') {` initializes a worker if the type is _init_. The rest of this block fetches data from a specified origin (`` consr res = await fetch(`${payload.origin}/content.json`); ``), extracts the fetched data (`const { blocks } = await res.json();`), initializes the search index using the fetched data (`init(blocks);`), and informs the main thread that it is ready (`postMessage({ type: 'ready' });`).
-   `if (type === 'query') {` initializes a worker if the type is _query_. The rest of this block performs a search based on the provided query (`const query = payload;`), and sends the search results back to the main thread (`postMessage({ type: 'results', payload: { results, query } });`).
-   `if (type === 'recents') {` initializes a worker if the type is _recents_. The rest of this block filters the payload for (`const results = payload.map(lookup).filter(Boolean);`) and sends the filtered recent results back to the main thread (`postMessage({ type: 'recents', payload: results });`).
    -   in more detail, the filter function:
        -   maps the payload to the lookup function, which looks up a block by its id (here, the href string)
        -   `payload` = the data received in the message from the main thread (here, an empty array on mount and then an array of search result href strings generated by SearchBox.svelte's navigate function)
        -   `lookup` then returns the whole block using href as key
        -   `filter(Boolean)` filters out any blocks that are not truthy (i.e. that are not found in the search index)

### 3.4. <a name='Thesearchcomponents'></a>The search components

#### 3.4.1. <a name='index'></a>index

This is an index file that exports the search components and functions.

```javascript:index.js
export { default as Search } from './Search.svelte';
export { default as SearchBox } from './SearchBox.svelte';
export { default as SearchResults } from './SearchResults.svelte';
export { init, inited, lookup, search } from './search.js';

/**
 * @typedef {import('./types.js').Block} Block
 */

/**
 * @typedef {import('./types.js').Tree} Tree
 */
```

#### 3.4.2. <a name='Search.svelte'></a>Search.svelte

This component is the form with a search input. On click, or keyboard shortcut, it opens the search overlay. Entering a search term will update the search_query and searching stores.

```javascript:Search.svelte
<!-- @component
Renders a search widget which when clicked (or the corresponding keyboard shortcut is pressed) opens a search overlay.
-->
<script>
	import { BROWSER } from 'esm-env';
	import { search_query, searching } from '../stores/search.js';

	export let q = '';
	export let label = 'Search';
</script>

<form class="search-container" action="/search">
	<input
		value={q}
		on:input={(e) => {
			$searching = true;
			$search_query = e.currentTarget.value;
			e.currentTarget.value = '';
		}}
		on:mousedown|preventDefault={() => ($searching = true)}
		on:touchend|preventDefault={() => ($searching = true)}
		type="search"
		name="q"
		placeholder={label}
		aria-label={label}
		spellcheck="false"
	/>

	{#if BROWSER}
		<div class="shortcut">
			<kbd>{navigator.platform === 'MacIntel' ? '⌘' : 'Ctrl'}</kbd> <kbd>K</kbd>
		</div>
	{/if}
</form>

```

<details>
<summary>Styles for Search.svelte</summary>

These styles are part of the Search.svelte component. I have split them out for clarity and won't discuss the CSS here.

```javascript
<style>
	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.search-container {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
	}

	input {
		position: relative;
		padding: 0.5em 0.5em 0.4em 2em;
		border: 1px solid var(--sk-back-translucent);
		font-family: inherit;
		font-size: 1.4rem;
		/* text-align: center; */
		appearance: none;
		-webkit-appearance: none;
		width: 100%;
		height: 4.2rem;
		border-radius: 3.5rem;
		background: no-repeat 1rem 50% / 1em 1em url(../icons/search.svg), var(--sk-back-3);
		color: var(--sk-text-3);
	}

	input:focus + .shortcut {
		display: none;
	}

	input::placeholder {
		font-size: 1.2rem;
		text-transform: uppercase;
		color: var(--sk-text-3);
		transform: translateY(-1px);
	}

	.shortcut {
		color: var(--sk-text-3);
		position: absolute;
		top: calc(50% - 0.9rem);
		right: 0;
		width: 100%;
		text-align: right;
		pointer-events: none;
		font-size: 1.2rem;
		text-transform: uppercase;
		animation: fade-in 0.2s;
	}

	kbd {
		display: none;
		background: var(--sk-back-2);
		border: 1px solid var(--sk-back-translucent);
		padding: 0.2rem 0.2rem 0rem 0.2rem;
		color: var(--sk-text-3);
		font-size: inherit;
		font-family: inherit;
		border-radius: 2px;
	}

	@media (min-width: 800px) {
		.search-container {
			width: 11rem;
		}

		.shortcut {
			padding: 0 1.6rem 0 0;
		}

		input {
			height: 3.4rem;
			border-radius: 5.6rem;
		}

		input::placeholder {
			opacity: 0;
		}

		/* we're using media query as an imperfect proxy for mobile/desktop */
		kbd {
			display: inline;
		}
	}

	@media (min-width: 960px) {
		.search-container {
			width: 19rem;
		}

		input::placeholder {
			opacity: 1;
		}
	}
</style>
```

</details>

##### Browser

-   `import { BROWSER } from 'esm-env';` is a [browser detection module](https://github.com/benmccann/esm-env), which returns true if the code is running in a browser, and false if it is running in a Node.js environment.
    Note that in sveltekit, `import { browser } from '$app/environment';` provides this functionality built-in.

##### 3.4.3. <a name='Importsandprops'></a>Imports and props

-   ` import { search_query, searching } from '../stores/search.js';` imports the search_query (string) and searching (Boolean) stores from the search.js file.

-   `export let q = '';` and `export let label = 'Search';` create props for the component. These are used to set the initial value of the search input and the placeholder text.

##### 3.4.4. <a name='Searchform'></a>Search form

-   `<form class="search-container" action="/search">` creates a form with a class of search-container and an action of /search. [Action is an HTML Form Element property](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/action), that is executed on the server when the form is submitted. Here [the action is /search](https://kit.svelte.dev/docs/form-actions#get-vs-post), which means submitting the form will navigate to `/search?q=...` and invoke the load function.

##### Input

-   `<input value={q} on:input={(e) => {` creates an _input_ element with a _value_ attribute equal to _q_. The _on:input_ event listener updates the _search_query_ store with the value of the input _q_.
-   `on:mousedown|preventDefault={() => ($searching = true)}` and `on:touchend|preventDefault={() => ($searching = true)}` are event listeners that set the _searching_ store to `true` when the input is clicked or tapped. This is used to open the search overlay.
-   `type="search"` sets the input type to search.
-   `name="q"` sets the name of the input to q. This is used to set the query string in the URL.
-   `placeholder={label}` sets the placeholder text to the value of the label prop.
-   `aria-label={label}` sets the aria-label to the value of the label prop.
-   `spellcheck="false"` disables spellcheck on the input.

##### Shortcut

-   `{#if BROWSER}` is a [block conditional](https://svelte.dev/docs#Block_conditional) that only renders the following code if BROWSER is true.
-   `<kbd>{navigator.platform === 'MacIntel' ? '⌘' : 'Ctrl'}</kbd> <kbd>K</kbd>` renders a keyboard shortcut. The first kbd element renders ⌘ if the platform is MacIntel, and Ctrl if it is not. The second kbd element renders K.
    -   This makes use of the [Navigator web API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator), which represents the state and identity of the user agent. Specifically, if uses the [navigator.platform](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorID/platform) property, to return the platform on which the browser is running.

#### 3.4.3. <a name='SearchBox.svelte'></a>SearchBox.svelte

It says _Renders a search box as an overlay that can be used to search the documentation. It appears when the user clicks on the `Search` component or presses the corresponding keyboard shortcut_, which is true but there's a lot going on here! It creates a web worker using `search-worker.js` that handles a lot of the search functionality and instead this component focuses a lot on rendering.

```javascript: SearchBox.svelte
<!-- @component
Renders a search box as an overlay that can be used to search the documentation.
It appears when the user clicks on the `Search` component or presses the corresponding keyboard shortcut.
-->
<script>
	import { afterNavigate } from '$app/navigation';
	import { overlay_open, search_query, search_recent, searching } from '$lib/stores';
	import { onMount, tick } from 'svelte';
	import { focusable_children, trap } from '../actions/focus.js';
	import Icon from '../components/Icon.svelte';
	import SearchResults from './SearchResults.svelte';
	import SearchWorker from './search-worker.js?worker';

	/** @type {HTMLElement} */
	let modal;

	/** @type {any} */
	let search = null;
	/** @type {any[]} */
	let recent_searches = [];

	/** @type {Worker} */
	let worker;
	let ready = false;

	let uid = 1;
	const pending = new Set();

	onMount(async () => {
		worker = new SearchWorker();

		worker.addEventListener('message', (event) => {
			const { type, payload } = event.data;

			if (type === 'ready') {
				ready = true;
			}

			if (type === 'results') {
				search = payload;
			}

			if (type === 'recents') {
				recent_searches = payload;
			}
		});

		worker.postMessage({
			type: 'init',
			payload: {
				origin: location.origin
			}
		});
	});

	afterNavigate(() => {
		// TODO this also needs to apply when only the hash changes
		// (should before/afterNavigate fire at that time? unclear)
		close();
	});

	async function close() {
		if ($searching) {
			$searching = false;
			const scroll = -parseInt(document.body.style.top || '0');
			document.body.style.position = '';
			document.body.style.top = '';
			document.body.tabIndex = -1;
			document.body.focus();
			document.body.removeAttribute('tabindex');
			window.scrollTo(0, scroll);
		}

		search = null;
	}

	/** @param {string} href */
	function navigate(href) {
		$search_recent = [href, ...$search_recent.filter((x) => x !== href)];
		close();
	}

	$: if (ready) {
		const id = uid++;
		pending.add(id);

		worker.postMessage({ type: 'query', id, payload: $search_query });
	}

	$: if (ready) {
		worker.postMessage({ type: 'recents', payload: $search_recent });
	}

	$: {
		tick().then(() => ($overlay_open = $searching));
	}

	$: if ($searching) {
		document.body.style.top = `-${window.scrollY}px`;
		document.body.style.position = 'fixed';

		$overlay_open = true;
		resetSearchQuery();
	}

	const resetSearchQuery = () => ($search_query = '');
</script>

<svelte:window
	on:keydown={(e) => {
		if (e.key === 'k' && (navigator.platform === 'MacIntel' ? e.metaKey : e.ctrlKey)) {
			e.preventDefault();
			$search_query = '';

			if ($searching) {
				close();
			} else {
				$searching = true;
			}
		}

		if (e.code === 'Escape') {
			close();
		}
	}}
/>

{#if $searching && ready}
	<div class="pseudo-overlay" aria-hidden="true" on:click={close} />

	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		bind:this={modal}
		class="modal"
		on:keydown={(e) => {
			if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
				e.preventDefault();
				const group = focusable_children(e.currentTarget);

				// when using arrow keys (as opposed to tab), don't focus buttons
				const selector = 'a, input';

				if (e.key === 'ArrowDown') {
					group.next(selector);
				} else {
					group.prev(selector);
				}
			}
		}}
		use:trap
	>
		<div class="search-box">
			<!-- svelte-ignore a11y-autofocus -->
			<input
				autofocus
				on:keydown={(e) => {
					if (e.key === 'Enter' && !e.isComposing) {
						/** @type {HTMLElement | undefined} */ (
							modal.querySelector('a[data-has-node]')
						)?.click();
					}
				}}
				on:input={(e) => {
					$search_query = e.currentTarget.value;
				}}
				value={$search_query}
				placeholder="Search"
				aria-describedby="search-description"
				aria-label="Search"
				spellcheck="false"
			/>

			<button aria-label="Close" on:click={close}>
				<Icon name="close" />
			</button>

			<span id="search-description" class="visually-hidden">
				<slot name="search-description">Results will update as you type</slot>
			</span>

			<div class="results">
				{#if search?.query}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<div class="results-container" on:click={() => ($searching = false)}>
						<SearchResults
							results={search.results}
							query={search.query}
							on:select={(e) => {
								navigate(e.detail.href);
							}}
						>
							<slot name="no-results" slot="no-results">No results</slot>
						</SearchResults>
					</div>
				{:else}
					<h2 class="info" class:empty={recent_searches.length === 0}>
						<slot name="idle" has_recent_searches={recent_searches.length}>
							{recent_searches.length ? 'Recent searches' : 'No recent searches'}
						</slot>
					</h2>
					{#if recent_searches.length}
						<div class="results-container">
							<ul>
								{#each recent_searches as search, i}
									<!-- svelte-ignore a11y-mouse-events-have-key-events -->
									<li class="recent">
										<a on:click={() => navigate(search.href)} href={search.href}>
											<small>{search.breadcrumbs.join('/')}</small>
											<strong>{search.breadcrumbs.at(-1)}</strong>
										</a>

										<button
											aria-label="Delete"
											on:click={(e) => {
												$search_recent = $search_recent.filter((href) => href !== search.href);
												e.stopPropagation();
												e.preventDefault();
											}}
										>
											<Icon name="delete" />
										</button>
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				{/if}
			</div>
		</div>
	</div>
{/if}

<div aria-live="assertive" class="visually-hidden">
	{#if $searching && search?.results.length === 0}
		<p><slot name="no-results">No results</slot></p>
	{/if}
</div>

```

<details>
<summary>
As before, the styles are here and I won't discuss the CSS
</summary>
```css
<style>
	.pseudo-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 100;
	}

    input {
    	font-family: inherit;
    	font-size: 1.6rem;
    	width: 100%;
    	padding: 1rem 6rem 0.5rem 1rem;
    	height: 5rem;
    	border: none;
    	border-bottom: 1px solid var(--sk-back-3);
    	font-weight: 600;
    	flex-shrink: 0;
    	background: var(--sk-back-2);
    	color: var(--sk-text-1);
    }

    input::selection {
    	background-color: var(--sk-back-translucent);
    }

    input::placeholder {
    	color: var(--sk-text-3);
    	opacity: 0.3;
    }

    input:focus-visible {
    	background: var(--sk-theme-2);
    	color: white;
    	outline: none;
    }

    input:focus-visible::placeholder {
    	color: rgba(255, 255, 255, 0.5);
    }

    button[aria-label='Close'] {
    	--size: 2rem;
    	position: absolute;
    	top: 0;
    	right: 0;
    	width: 5rem;
    	height: 5rem;
    	background: none;
    	color: var(--sk-text-2);
    }

    button[aria-label='Close']:focus-visible {
    	background: var(--sk-theme-2);
    	color: var(--sk-back-1);
    	outline: none;
    }

    input:focus-visible + button[aria-label='Close'] {
    	color: var(--sk-back-1);
    }

    ul {
    	margin: 0;
    }

    .modal {
    	position: fixed;
    	left: 0;
    	top: 0;
    	width: 100%;
    	height: 100%;
    	z-index: 9999;
    }

    .modal {
    	display: flex;
    	justify-content: center;
    	align-items: center;
    	pointer-events: none;
    }

    .search-box {
    	position: relative;
    	height: calc(100% - 2rem);
    	width: calc(100vw - 2rem);
    	max-width: 50rem;
    	max-height: 50rem;
    	filter: drop-shadow(2px 4px 16px rgba(0, 0, 0, 0.2));
    	border-radius: var(--sk-border-radius);
    	display: flex;
    	flex-direction: column;
    	overflow: hidden;
    }

    .search-box > * {
    	pointer-events: all;
    }

    .results {
    	overflow: auto;
    	overscroll-behavior-y: none;
    }

    .results-container {
    	background: var(--sk-back-2);
    	border-radius: 0 0 var(--sk-border-radius) var(--sk-border-radius);
    	pointer-events: all;
    }

    .info {
    	padding: 1rem;
    	font-size: 1.2rem;
    	font-weight: normal;
    	text-transform: uppercase;
    	background-color: var(--sk-back-2);
    	pointer-events: all;
    }

    .info.empty {
    	border-radius: 0 0 var(--sk-border-radius) var(--sk-border-radius);
    }

    a {
    	display: block;
    	text-decoration: none;
    	line-height: 1;
    	padding: 1rem;
    }

    a:hover {
    	background: rgba(0, 0, 0, 0.05);
    }

    a:focus {
    	background: var(--sk-theme-2);
    	color: var(--sk-back-1);
    	outline: none;
    }

    a small,
    a strong {
    	display: block;
    	white-space: nowrap;
    	overflow: hidden;
    	text-overflow: ellipsis;
    	line-height: 1;
    }

    a small {
    	font-size: 1rem;
    	text-transform: uppercase;
    	font-weight: 600;
    	color: var(--sk-text-3);
    }

    a strong {
    	font-size: 1.6rem;
    	color: var(--sk-text-2);
    	margin: 0.4rem 0;
    }

    a:focus small {
    	color: white;
    	opacity: 0.6;
    }

    a:focus strong {
    	color: white;
    }

    a strong :global(mark) {
    	background: var(--sk-theme-2);
    	color: var(--sk-text-3);
    	text-decoration: none;
    	border-radius: 1px;
    }

    li {
    	position: relative;
    }

    button[aria-label='Delete'] {
    	position: absolute;
    	top: 0;
    	right: 0;
    	width: 5rem;
    	height: 100%;
    	color: var(--sk-text-2);
    	opacity: 0.1;
    }

    a:focus + [aria-label='Delete'] {
    	color: var(--sk-back-1);
    }

    button[aria-label='Delete']:hover {
    	opacity: 1;
    	outline: none;
    }

    button[aria-label='Delete']:focus-visible {
    	background: var(--sk-theme-2);
    	color: var(--sk-text-1);
    	opacity: 1;
    	outline: none;
    }

</style>
```
</details>

##### Imports

-   [afterNavigate is a sveltekit lifecycle function](https://kit.svelte.dev/docs/modules#$app-navigation-afternavigate) that runs the supplied callback when the current component mounts, and after navigation a new URL.
-   `overlay_open`, `search_query`, `search_recent` and `searching` are stores, already discussed in the [nav.js](#nav.js) and [search.js](#search.js) sections.
-   ```
    that schedules a callback to run as soon as the component is mounted on the page.
    ```
-   [tick is a svelte lifecycle function](https://svelte.dev/docs/svelte#tick) that schedules a callback to run after the next time the component is updated.
-   [focusable_children()](#focusable_children) and [trap()](#trap) are actions, discussed above.
-   Icon is the [svelte icon](https://commons.wikimedia.org/wiki/File:Svelte_Logo.svg)
-   `SearchResults` is a component that formats the search results, discussed in the [SearchResults section](#SearchResults).
-   `SearchWorker` is `search-worker.js,` discussed in the [search-worker.js section](<(#search-worker.js)>).

Variables

```javascript
/** @type {HTMLElement} */
let modal;

/** @type {any} */
let search = null;
/** @type {any[]} */
let recent_searches = [];

/** @type {Worker} */
let worker;
let ready = false;

let uid = 1;
const pending = new Set();
```

This section instantiates a number of variables (with types) for use in the component.

##### onMount

```javascript
onMount(async () => {
	worker = new SearchWorker();

	worker.addEventListener('message', (event) => {
		const { type, payload } = event.data;

		if (type === 'ready') {
			ready = true;
		}

		if (type === 'results') {
			search = payload;
		}

		if (type === 'recents') {
			recent_searches = payload;
		}
	});

	worker.postMessage({
		type: 'init',
		payload: {
			origin: location.origin
		}
	});
});
```

This section calls the [svelte lifecycle function onMount](https://svelte.dev/docs#onMount) which runs the supplied callback when the component is mounted on the page. It instantiates a new `SearchWorker` and adds an event listener to it. The event listener checks the type of the event and sets the `search` and `recent_searches` variables accordingly. It then posts a message to the worker to initialise it.

##### afterNavigate

```javascript
afterNavigate(() => {
	// TODO this also needs to apply when only the hash changes
	// (should before/afterNavigate fire at that time? unclear)
	close();
});

async function close() {
	if ($searching) {
		$searching = false;
		const scroll = -parseInt(document.body.style.top || '0');
		document.body.style.position = '';
		document.body.style.top = '';
		document.body.tabIndex = -1;
		document.body.focus();
		document.body.removeAttribute('tabindex');
		window.scrollTo(0, scroll);
	}

	search = null;
}
```

This section calls the [sveltekit lifecycle function afterNavigate](https://kit.svelte.dev/docs/modules#$app-navigation-afternavigate) which runs the supplied callback when the current component mounts or after navigation a new URL. It calls the `close` function, which sets the `searching` store to false, and resets the scroll position of the page.

##### navigate function

```javascript
/** @param {string} href */
function navigate(href) {
	$search_recent = [href, ...$search_recent.filter((x) => x !== href)];
	close();
}
```

This function takes a string `href` and sets the `search_recent` store to an array containing the `href` and all the other elements of the `search_recent` store that are not equal to the `href`. It then calls the `close` function.

##### Sending messages to SearchWorker

The following [reactive statements](https://svelte.dev/docs/svelte-components#script-3-$-marks-a-statement-as-reactive) run after other script code and before the component markup is rendered, whenver the values that they depend on change.

`ready` is instantiated as `false` and set to `true` by `search-worker.js` when it has initialised the search index.

```javascript
$: if (ready) {
	const id = uid++;
	pending.add(id);

	worker.postMessage({ type: 'query', id, payload: $search_query });
}

$: if (ready) {
	worker.postMessage({ type: 'recents', payload: $search_recent });
}
```

These two reactive statements send messages to the `SearchWorker` when `ready` is `true`. The first sends a message containing the `search_query` store and a unique id. The second sends a message containing the `search_recent` store.

##### Managing the overlay

`$: {tick().then(() => ($overlay_open = $searching));}` is a reactive statement that sets the `overlay_open` store to the Boolean `searching` store after the next time the component is updated.

##### Managing the modal

```javascript
$: if ($searching) {
	document.body.style.top = `-${window.scrollY}px`;
	document.body.style.position = 'fixed';

	$overlay_open = true;
	resetSearchQuery();
}
```

This queries searching store and if it is true, sets the `top` and `position` styles of the `document.body` element, sets the `overlay_open` store to `true` and calls the `resetSearchQuery` function.

##### Resetting the search query

`const resetSearchQuery = () => ($search_query = '');` sets the search query store to an empty string when called.

##### Rendering

###### Adding an event listener to window

The markup begins with `<svelte:window`, which creates a [svelte:window element](https://svelte.dev/docs/special-elements#svelte-window) that allows access to the [browser's window object](https://developer.mozilla.org/en-US/docs/Web/API/Window) without needing to check for the existence of window or worrying about destroying evnet listeners when the component is destroyed.

In this case it is an on:keydown event listener, which uses [svelte's on: directive](https://svelte.dev/docs/element-directives#on-eventname) to listen for a [keydown event](https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event). In this case the evern listener listens for:

1. ctrl + k or cmd + k (depending on [platform](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/platform)) sets the _search_query_ store to an empty string and, if the _searching_ store is true calls _close()_, or if _searching_ store is `false` sets it to `true`.
2. escape calls the _close()_ function.

###### Showing the modal

The next is an [if expression](https://svelte.dev/docs/logic-blocks#if) which renders if _searching_ and *ready *are both `true`: `{#if $searching && ready}`

-   `<div class="pseudo-overlay" aria-hidden="true" on:click={close} />` fills the screen with an overlay which runs _close()_ on click to dismiss the search modal and rest search, with `z-index: 100` so it sits on top of all content but below the modal

-   Next the modal

```javascript
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		bind:this={modal}
		class="modal"
		on:keydown={(e) => {
			if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
				e.preventDefault();
				const group = focusable_children(e.currentTarget);

				// when using arrow keys (as opposed to tab), don't focus buttons
				const selector = 'a, input';

				if (e.key === 'ArrowDown') {
					group.next(selector);
				} else {
					group.prev(selector);
				}
			}
		}}
		use:trap
	>
```

-   `svelte-ignore a11y-no-static-element-interactions` uses [svelte-ignore](https://svelte.dev/docs/accessibility-warnings) to silence the [a11y-no-static-element-interactions](https://svelte.dev/docs/accessibility-warnings#a11y-no-static-element-interactions) warning, which specifies that elements like `<div>` with handlers like `click` must have an [ARIA role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles).
-   `bind:this={modal}` binds the `modal` variable to the `div` element, which allows access to the element's properties and methods.
    -   Modal was defined as an HTMLElement in the script section.
    -   svelte's [bind:this directive](https://svelte.dev/docs/element-directives#bind-this) gets a reference to a DOM node.
-   Next another on:keydown directive, listens for arrow up or arrow down key press events and gets the focusable children of the current target (`const group = focusable_children(e.currentTarget);`) and navigates through them using [focusable_children's next and prev](#nextandprevmethods) methods.
-   finally it the [use directive](https://svelte.dev/docs/element-directives#use-action) calls the [trap()](#trap) function to trap focus within the modal.

-   the next div is the actual search box:

    ```javascript
    <div class="search-box">
    		<!-- svelte-ignore a11y-autofocus -->
    		<input
    			autofocus
    			on:keydown={(e) => {
    				if (e.key === 'Enter' && !e.isComposing) {
    					/** @type {HTMLElement | undefined} */ (
    						modal.querySelector('a[data-has-node]')
    					)?.click();
    				}
    			}}
    			on:input={(e) => {
    				$search_query = e.currentTarget.value;
    			}}
    			value={$search_query}
    			placeholder="Search"
    			aria-describedby="search-description"
    			aria-label="Search"
    			spellcheck="false"
    		/>
    ```

    -   `svelte-ignore a11y-autofocus` silences the [a11y-autofocus](https://svelte.dev/docs/accessibility-warnings#a11y-autofocus) warning, which specifies that autofocus should not be used.
    -   `<input autofocus` creates an [input element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input) and autofocuses it when the modal is opened.
    -   `on:keydown={(e) => { if (e.key === 'Enter' && !e.isComposing)` listens for keydown events and if the key is enter and the event is not composing (i.e. it is not part of a composition session) it clicks the first link with a data-has-node attribute. - [isComposing is an HTML input event](https://developer.mozilla.org/en-US/docs/Web/API/InputEvent/isComposing) that specifies whether the event is part of a composition session. - within the keydown event listener, ` modal.querySelector('a[data-has-node]')```uses the [query selector API](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector) to select the first link with a data-has-node attribute. -  `data-has-node`is set by [Search Result List](#searchresultlistsvelte)  component to indicate that the link has a node associated with it. -`)?.click();` if the query selector returns a link, it clicks it using the HTML element's [click() method](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/click).
        -   `on:input={(e) => { $search_query = e.currentTarget.value; }}` listens for input events and sets the search query to the current target's value.
        -   `value={$search_query}` sets the input's value to the search query store.
        -   `placeholder="Search"` sets the input's placeholder to "Search".
        -   `aria-describedby="search-description"` and `aria-label="Search"` set the aria description and label to "search-description" and _"Search"_ respectively. This links the input element to a hidden span element containing the text "Results will appear as you type" which is read by screen readers.
        ````html
        <span id="search-description" class="visually-hidden">
        	<slot name="search-description">Results will update as you type</slot>
        </span>
        ``` - ```spellcheck="false"``` [turns off
        spellcheck](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/spellcheck)
        ````

-   next is a close button that calls _close()_ on click.

-   next is `<div class="results">`, still within the `<div class="search-box">`, modal, and `{#if $searching && ready}` expression.

    ```javascript
    {#if search?.query}
    				<!-- svelte-ignore a11y-click-events-have-key-events -->
    				<div class="results-container" on:click={() => ($searching = false)}>
    					<SearchResults
    						results={search.results}
    						query={search.query}
    						on:select={(e) => {
    							navigate(e.detail.href);
    						}}
    					>
    						<slot name="no-results" slot="no-results">No results</slot>
    					</SearchResults>
    				</div>
    ```

    If there is a search query, it creates a div with class "results-container", which displays the [search results](#345-searchresultssvelte) link. Clicks on the container set searching to false (`on:click={() => ($searching = false)}`), and selecting a search result navigates to the search result's href (`on:select={(e) => {navigate(e.detail.href);}}`).

    ```javascript
    {:else}
    	<h2 class="info" class:empty={recent_searches.length === 0}>
    		<slot name="idle" has_recent_searches={recent_searches.length}>
    			{recent_searches.length ? 'Recent searches' : 'No recent searches'}
    		</slot>
    	</h2>
    ```

    Here there are 2 outcomes, depending on whether recent_searches.length is greater than 0.

    1.  No recent searches:

        ```javascript
        <h2 class="info empty">
        	<slot name="idle" has_recent_searches={recent_searches.length}>
        		No recent searches
        	</slot>
        </h2>
        ```

        As recent_searches.length is 0, the slot is rendered with the text "No recent searches" with minimal CSS. `Empty` is added to the class list using [svelte's class: directive](https://svelte.dev/docs/element-directives#class-name) and there is a [compound selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_selectors/Selector_structure#compound_selector) in the CSS for `.info.empty` that only shows a box with rounded corners. Note a compound selector is a sequence of simple selectors with no [combinator](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_selectors/Selectors_and_combinators#combinators) separating them, and is used to select elements that match all of the selectors. `.info.empty` comes after `.info` in the [CSS cascade](https://developer.mozilla.org/en-US/docs/Web/CSS/Cascade#cascading_order), and so is applied preferentially.

    2.  There are recent searches:
        ```javascript
        <h2 class="info">
        	<slot name="idle" has_recent_searches={recent_searches.length}>
        		Recent searches
        	</slot>
        </h2>
        ```

    Here, `empty` is not added to the style list and so the h2 element is rendered with slot content. The slot content is now the text "Recent searches", as recent_searches.length is greater than 0.

    Further, another [if expression](https://svelte.dev/docs/logic-blocks#if) displays a div containing results `{#if recent_searches.length}  <div class="results-container">`. This div contains an [unordered list](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ul) containing the recent searches. Each item displays the category and title of the search result as a link. The link has an `on:click` event that calls `navigate(search.href)` and the delete button has an `on:click` event that removes the search from the recent searches list. Note that the delete button has an `aria-label` of "Delete" and an `aria-label` of "Delete" to make it accessible to screen readers, which is also used for styling using the CSS selector `button[aria-label='Delete']`. I like that the initial opacity is 0.1 and the [:hover](https://developer.mozilla.org/en-US/docs/Web/CSS/:hover) pseudo-class increases it to 1, rather than changing colour or adding a border.

    ```javascript
    <ul>
    	{#each recent_searches as search, i}
    		<!-- svelte-ignore a11y-mouse-events-have-key-events -->
    		<li class="recent">
    			<a on:click={() => navigate(search.href)} href={search.href}>
    				<small>{search.breadcrumbs.join('/')}</small>
    				<strong>{search.breadcrumbs.at(-1)}</strong>
    			</a>

    			<button
    				aria-label="Delete"
    				on:click={(e) => {
    					$search_recent = $search_recent.filter((href) => href !== search.href);
    					e.stopPropagation();
    					e.preventDefault();
    				}}
    			>
    				<Icon name="delete" />
    			</button>
    		</li>
    	{/each}
    </ul>
    ```

Another feature here is the on:click handler for the delete button calls both `e.stopPropagation();` and `e.preventDefault();` methods: - [stopPropogation()]https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation prevents the event from bubbling up the DOM tree, preventing any parent handlers from being notified of the event. - [preventDefault()](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault). The [default behaviour of a button](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button) which isn't `submit` or `reset` is nothing, however this is a good practice to prevent any potential issues caused by changes in default behavior in the future and explicitly states the intentions regarding the button's behavior.

-   finally there is:

```javascript
<div aria-live="assertive" class="visually-hidden">
	{#if $searching && search?.results.length === 0}
		<p><slot name="no-results">No results</slot></p>
	{/if}
</div>
```

This exists for assisitve technology users, and is a [visually hidden](https://www.scottohara.me/blog/2017/04/14/inclusively-hidden.html) div that is only visible to screen readers. It contains a paragraph element with the text "No results" if there are no search results. The CSS is:

```css
/* visually hidden, but accessible to assistive tech */
.visually-hidden {
	border: 0;
	clip: rect(0 0 0 0);
	height: auto;
	margin: 0;
	overflow: hidden;
	padding: 0;
	position: absolute;
	width: 1px;
	white-space: nowrap;
}
```

The `aria-live="assertive"` attribute creates a [live region](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions), which is a dynamic region which updates without page reload. An assertive live region will interrupt and announcement a screen reader is currently making.

#### 3.4.4. <a name='SearchResultList.svelte'></a>SearchResultList.svelte

This component is used to display the search results. It is imported into [SearchBox.svelte](#343-searchboxsvelte) and displayed with `searching=true`, `ready=true` and `search.query` is [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy). It formats returned search results to display the title an excerpt of the content by category. The excerpt function takes the content and query as parameters, and returns the content with the query highlighted by wrapping it in [mark](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/mark) tag.

```javascript
<script>
	import { createEventDispatcher } from 'svelte';

	/** @type {import('./types').Tree[]} */
	export let results;

	/** @type {string} */
	export let query;

	const dispatch = createEventDispatcher();

	/** @param {string} text */
	function escape(text) {
		return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	/**
	 * @param {string} content
	 * @param {string} query
	 */
	function excerpt(content, query) {
		const index = content.toLowerCase().indexOf(query.toLowerCase());
		if (index === -1) {
			return escape(content.slice(0, 100));
		}

		const prefix = index > 20 ? `…${content.slice(index - 15, index)}` : content.slice(0, index);
		const suffix = content.slice(
			index + query.length,
			index + query.length + (80 - (prefix.length + query.length))
		);

		return (
			escape(prefix) +
			`<mark>${escape(content.slice(index, index + query.length))}</mark>` +
			escape(suffix)
		);
	}
</script>

<ul>
	{#each results as result (result.href)}
		<li>
			<a
				data-sveltekit-preload-data
				href={result.href}
				on:click={() => dispatch('select', { href: result.href })}
				data-has-node={result.node ? true : undefined}
			>
				<strong>{@html excerpt(result.breadcrumbs[result.breadcrumbs.length - 1], query)}</strong>

				{#if result.node?.content}
					<span>{@html excerpt(result.node.content, query)}</span>
				{/if}
			</a>

			{#if result.children.length > 0}
				<svelte:self results={result.children} {query} on:select />
			{/if}
		</li>
	{/each}
</ul>
```

##### Custom event

This file imports [svelte's createEventDispatcher lifecycle function](https://svelte.dev/docs/svelte#createeventdispatcher), which can be used to dispatch [component events](https://svelte.dev/docs/component-directives#on-eventname). A new event is created `const dispatch = createEventDispatcher();` and later a custom event is dispatched with `dispatch('select', { href: result.href })`. This event is handled in [SearchBox.svelte](#343-searchboxsvelte) with `on:select={(e) => {navigate(e.detail.href); }}`.

##### Props

The component takes two props, `results` and `query`. `results` is an array of [Tree](#typesjs) objects, and `query` is a string. The `results` prop is used in a [each block](https://svelte.dev/docs#each) to iterate over the array and display the results. The `query` prop is used in the [excerpt function](#excerpt-function) to highlight the query in the results.

##### escape function

The `escape` function takes a string as a parameter and returns the string with `<` and `>` replaced with `&lt;` and `&gt;` respectively.

##### excerpt function

The excerpt function is take content and query as params (`function excerpt(content, query) {`) and first creates `index` with both set to lower case: `const index = content.toLowerCase().indexOf(query.toLowerCase());`. It then checks if the query is in the content, and if not returns the first 100 characters of the content: `if (index === -1) { return escape(content.slice(0, 100)); }`. If the query is in the content, it returns a 3 part element:

1. `` const prefix = index > 20 ? `…${content.slice(index - 15, index)}` : content.slice(0, index); `` checks whether there are 20 characters before the query. If there are less than 20 characters from content start to query, it returns them all; if there are more than 20 characters before the query, it returns the first 15 characters before the query.
2. `const suffix = content.slice( index + query.length, index + query.length + (80 - (prefix.length + query.length)) );` returns the first 80 characters after the query.
3. `` return ( escape(prefix) + `<mark>${escape(content.slice(index, index + query.length))}</mark>` + escape(suffix) ); `` returns the prefix, the query wrapped in a [mark](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/mark) tag, and the suffix.

##### HTML

Here, an [unordered list](https://svelte.dev/docs/logic-blocks#each) containing a [svelte each expression](https://svelte.dev/docs/logic-blocks#each) loops through the results array. Each result is displayed in a list item, with a link to the result's href. The link has:

-   a [data-sveltekit-preload-data](https://kit.svelte.dev/docs/link-options#data-sveltekit-preload-data) attribute, which is used to preload data for the destination page data on hover or click, ensuring faster navigation through the site. The link also has an [on:click](https://svelte.dev/docs/element-directives#on-eventname) event handler, which dispatches the custom event with the result's href.
-   [an HTML data- element](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/data-*), `data-has-node={result.node ? true : undefined}`, which is true if the result has a node, and undefined if it doesn't - this is used by [SearchBox's input element](#343-searchboxsvelte) to navigate to the top result when enter is pressed.
-   [a strong element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/strong), which displays the result title (which is the last element in the result's breadcrumbs array).
-   If the result has a node, it also displays a span element with the result's node content.

Outside the link but with in the item, there is also an [if expression](https://svelte.dev/docs/logic-blocks#if) that displays if the result has children. If so, it displays a [svelte self component](https://svelte.dev/docs/special-elements#svelte-self) with the result's children as the results prop and the query as the query prop. Svelte self components are able to render themselves recursively, so this allows the component to display the children of the result's children, and so on. Finally, there is an event listener `on:select`, which triggers the rendering when a 'select' event is dispatched (which occurs when a result link is clicked).

<details>
<summary>
Styles here
</summary>
```css
<style>
	ul {
		position: relative;
		margin: 0;
	}

    ul :global(ul) {
    	margin-left: 0.8em !important;
    	padding-left: 0em;
    	border-left: 1px solid var(--sk-back-5);
    }

    li {
    	list-style: none;
    	margin-bottom: 1em;
    }

    li:last-child {
    	margin-bottom: 0;
    }

    ul ul li {
    	margin: 0;
    }

    a {
    	display: block;
    	text-decoration: none;
    	line-height: 1;
    	padding: 1rem;
    }

    a:hover {
    	background: rgba(0, 0, 0, 0.05);
    }

    a:focus {
    	background: var(--sk-theme-2);
    	color: white;
    	outline: none;
    }

    a strong,
    a span {
    	display: block;
    	white-space: nowrap;
    	line-height: 1;
    	overflow: hidden;
    	text-overflow: ellipsis;
    }

    a strong {
    	font-size: 1.6rem;
    	color: var(--sk-text-2);
    }

    a span {
    	font-size: 1.2rem;
    	color: #737373;
    	margin: 0.4rem 0 0 0;
    }

    a :global(mark) {
    	--highlight-color: rgba(255, 255, 0, 0.2);
    }

    a span :global(mark) {
    	background: none;
    	color: var(--sk-text-1);
    	background: var(--highlight-color);
    	outline: 2px solid var(--highlight-color);
    	border-top: 2px solid var(--highlight-color);
    	/* mix-blend-mode: darken; */
    }

    a:focus span {
    	color: rgba(255, 255, 255, 0.6);
    }

    a:focus strong {
    	color: white;
    }

    a:focus span :global(mark),
    a:focus strong :global(mark) {
    	--highlight-color: hsl(240, 8%, 54%);
    	mix-blend-mode: lighten;
    	color: white;
    }

    a strong :global(mark) {
    	color: var(--sk-text-1);
    	background: var(--highlight-color);
    	outline: 2px solid var(--highlight-color);
    	/* border-top: 2px solid var(--highlight-color); */
    	border-radius: 1px;
    }

</style>
```
</details>
#### 3.4.5. <a name='SearchResults.svelte'></a>SearchResults.svelte

This file renders a list of search results. It is used by [SearchBox.svelte](#343-searchboxsvelte) to display the results of a search query:

```javascript
<!--@component
Renders a list of search results
-->
<script>
	import SearchResultList from './SearchResultList.svelte';

	/** @type {import('./types').Tree[]} */
	export let results;

	/** @type {string} */
	export let query;
</script>

{#if results.length > 0}
	<SearchResultList {results} {query} on:select />
{:else if query}
	<p class="info"><slot name="no-results">No results</slot></p>
{/if}

<style>
	.info {
		padding: 1rem;
		font-size: 1.2rem;
		font-weight: normal;
		text-transform: uppercase;
		background-color: var(--sk-back-2);
		border-radius: 0 0 var(--sk-border-radius) var(--sk-border-radius);
		pointer-events: all;
		margin: 0;
	}
</style>
```

It accepts results and query as props, and renders a [SearchResultList](#searchresultlistsvelte) component if there are results, or a paragraph element with the text 'No results' if there is a query but there are are no results.

### types.d.ts

```typescript: types.d.ts
export interface Block {
	breadcrumbs: string[];
	href: string;
	content: string;
	rank: number;
}

export interface Tree {
	breadcrumbs: string[];
	href: string;
	node: Block;
	children: Tree[];
}
```
