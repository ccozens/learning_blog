---
title: Search Filter with Reactive Statements
date: '2023-08-03'
description: Making a search filter with reactive statements
tags:
    - levelup
    - sveltekit
    - components
---

#[Search Filter with Reactive Statements](https://levelup.video/tutorials/building-svelte-components/search-filter-with-reactive-statements)

1. Create component (`SearchFitler.svelte`) with _items_ prop, text input and a list that loops through items:

```
<script>
	export let items = [''];
</script>

<input type="text" />

<ul>
	{#each items as item}
		<li>{item}</li>
	{/each}
</ul>
```

2. Display it in `+page.svelte`:

```
<script>
	import SearchFilter from '$lib/SearchFilter.svelte';


</script>

<SearchFilter {items} />
```

3. Update `SearchFilter.svelte` to (1) create _search_ var, (2) add placeholder to input and (3) [bind](https://svelte.dev/docs/element-directives#bind-property) the value of the input to _search_.

```
<script>
	export let items = [''];
	let search = '';

    $: console.log(search);
</script>

<label>
	Search Names: <br />
	<input
        type="text"
        placeholder="search"
        bind:value={search} />
</label>
```

4. Filter names based on search value:

```
<script>
	export let items = [''];
	let search = '';

    $: filteredSearch = items.filter((item) => {
        // return true if no search
        return search === ''
        // or
        ||
        // return true if index is not -1
        item.indexOf(search) !== -1;
    })
</script>

<label>
	Search Names: <br />
	<input
        type="text"
        placeholder="search"
        bind:value={search} />
</label>

<ul>
	{#each filteredSearch as item}
		<li>{item}</li>
	{/each}
</ul>

```

Note:

-   filteredSearch is a [reactive statement](https://svelte.dev/docs/svelte-components#script-3-$-marks-a-statement-as-reactive), meaning _filteredSearch_ will rerun whenever its dependencies (here, _items_ and _search_ update).
-   _filteredSearch_ uses [filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) to loop through items and returns everything if there is no search term, or just those that match if there is a match.
-   [Array.prototype.indexOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf) returns -1 if search term not found.

5. 2 tweaks to deal with capitalization.
   First to the javascript to treat all search input and items as lower case: `item.toLowerCase().indexOf(search.toLowerCase()) !== -1;`
   Second add a little CSS to display the results with first letter capitalized, if they weren't aready:
   ```<style>
   li {
   text-transform: capitalize;
   }
   </style>

```

```
