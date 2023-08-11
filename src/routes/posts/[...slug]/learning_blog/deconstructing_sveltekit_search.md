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

-   1. [Overview](#Overview)
-   2. [What is it?](#Whatisit)
-   3. [The files](#Thefiles)
    -   3.1. [The stores](#Thestores)
        -   3.1.1. [nav.js](#nav.js)
        -   3.1.2. [search.js](#search.js)
    -   3.2. [The actions](#Theactions)
        -   3.2.1. [focusable_children()](#focusable_children)
        -   3.2.2. [next() and prev() methods](#nextandprevmethods)
        -   3.2.3. [trap()](#trap)
    -   3.3. [Javascript files](#Javascriptfiles)
        -   3.3.1. [search.js](#search.js-1)
    -   3.4. [The search components](#Thesearchcomponents)
        -   3.4.1. [index](#index)
        -   3.4.2. [Search.svelte](#Search.svelte)
        -   3.4.3. [Imports and props](#Importsandprops)
        -   3.4.4. [Search form](#Searchform)
    -   3.5. [SearchBox.svelte](#SearchBox.svelte)

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

This file contains four stores, all of which are simple [writable stores](https://svelte.dev/docs/svelte-store#writable) with default value `false`.
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
-   The destoy function is triggered when the component is destroyed, and removes the event listener.
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

#### Flexsearch

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
-   [index.search(string, <limit>, <options>)](https://github.com/nextapps-de/flexsearch#search-items) -> used for seaching!.
    -   basic search: `index.search("John");`
    -   search limiting to 10 results: `index.search("John", 10);`
-   [index.search(options)](https://github.com/nextapps-de/flexsearch#search-options) -> define how search is carried out, e.g. `index.search({ query: "John", limit: 10, suggest: true });` enables suggestions in results
-   [index.export(key, data)](https://github.com/nextapps-de/flexsearch#export) -> export data
-   [index.import(key, data)](https://github.com/nextapps-de/flexsearch#import) -> import data. Note you ned to create an index before can import data into it.
    Each method can also been called as an [async method](https://github.com/nextapps-de/flexsearch#async), e.g. `index.addAsync(id, content, function(){}` by passing a callback, returning a Promise or using async/await.

There are futher options, for example using a [built-in tokenizer](https://github.com/nextapps-de/flexsearch#tokenizer-prefix-search) or [defining a custom tokenizer](https://github.com/nextapps-de/flexsearch#add-custom-tokenizer): `var index = new FlexSearch({ tokenize: function(str) { return str.split(/\s-\//g); } });` , which takes a string and returns an array of strings, and [encoders](https://github.com/nextapps-de/flexsearch#encoders), which affect memory requirement, query time and phonetic matches.

#### Search function

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
    -   adds data to the appripriate FlexSearch index based on the rank of a block: `` indexes[block.rank ?? 0].add(block.href, `${title} ${block.content}`); ``. Specifically:
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

#### search-worker.js

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

#### Web workers

Web workers are a way to run JavaScript code in the background, without blocking the main thread. They are useful for running expensive operations, such as searching, without blocking the main thread. They are also useful for running code that is not needed immediately, such as code that is only needed when a user clicks a button. They communicate with the main thread via the [Worker interface postMessage() method and the onmessage event handler](https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage).

This code fulfills MDN's definition of a web worker as:

1. Background execution: it executes in the background, separate from the main thread. This enables the worker to perform tasks without affecting the user interface.
2. Interference-free: it can fetch data and process it, without blocking the main thread, and hence without blocking the user interface.
3. Communication: it communicates with the main thread through messages. The main thread posts messages to the worker using the postMessage() method, and the worker responds to messages via the onmessage event handler.
4. Data Isolation: data is passed between the main thread and the worker using messages, and the data is copied rather than shared. This ensures data isolation and prevents direct manipulation of the DOM from the worker.

#### Breakdown

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

#### 3.4.3. <a name='Importsandprops'></a>Imports and props

-   ` import { search_query, searching } from '../stores/search.js';` imports the search_query (string) and searching (Boolean) stores from the search.js file.

-   `export let q = '';` and `export let label = 'Search';` create props for the component. These are used to set the initial value of the search input and the placeholder text.

#### 3.4.4. <a name='Searchform'></a>Search form

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

### 3.5. <a name='SearchBox.svelte'></a>SearchBox.svelte

types

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
