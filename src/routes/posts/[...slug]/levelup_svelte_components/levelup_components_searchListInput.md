---
title: Search List Input
date: '2023-08-03'
description: description
tags:
  - levelup
  - sveltekit
  - components
---
#[Search List Input](https://levelup.video/tutorials/building-svelte-components/search-list-input)

Start from search filter, and rename ```SearchList.svelte```.
>The output here is not keyboard scrollable of focussable


1. Modify the ```<ul>``` to make the components clickable:

```
<ul>
	{#each filteredSearch as item}
		<li on:click={() => search = item}>{item}</li>
	{/each}
</ul>
```

Now clicking on any element will make it the search term.

2. Use [on directive](https://svelte.dev/docs/element-directives#on-eventname) to listen for DOM events, here [focus](g/en-US/docs/Web/API/HTMLElement/focus) and [blur](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/blur), so that the list of items only appears below the search input when the search input is clicked (ie receives focus) and is hidden when click away (on blur).

```
<script>
	export let items = [''];
	let search = '';
	let isFocused = false;

	// filteredSearch omitted
</script>

<label>
	Search Names: <br />
	<input
		on:focus={() => (isFocused = true)}
		on:blur={() => (isFocused = false)}
		type="text"
		placeholder="search"
		bind:value={search}
	/>
</label>

{#if isFocused}
	<ul>
		{#each filteredSearch as item}
			<li on:click={() => (search = item)}>{item}</li>
		{/each}
	</ul>
{/if}
```

3. There is no autocomplete on typing. One way round this is to make the user click on something:

Update the ```<ul>``` element so that clicking an item is what sets isFocused to false and hides the list:
```
{#if isFocused}
	<ul>
		{#each filteredSearch as item}
			<li
				on:click={() => {
					search = item;
					isFocused = false;
				}}
			>
				{item}
			</li>
		{/each}
	</ul>
{/if}
```

and remove ```on:blur={() => (isFocused = false)}``` from the ```<input>``` as now redundant.

Here, ```onFocus``` is set true when we click on the input (which displays the list of names), and clicking sets ```onFocus``` to false and so hides the rest of the list.

4. Animations!

```
<script>
	import { fade } from 'svelte/transition';
	...
</script>

<!-- omitted label --!>

{#if isFocused}
	<ul transition:fade={{ duration: 200 }}>
		{#each filteredSearch as item}
			<li
				transition:fade={{ duration: 200 }}
				on:click={() => {
					search = item;
					isFocused = false;
				}}
			>
				{item}
			</li>
		{/each}
	</ul>
{/if}
```

Added 200 ms fade to the ul and individual li transitions.

5. Styles!

Wrap the whole markup in ```<div class="wrapper">``` and:

```
<style>
	.wrapper {
		position: relative;
		display: inline-block;
	}

ul {
	position: absolute;
	width: 50%;
	border: solid 1px #333;
	padding: 0;
	margin: 0;
}

	li {
		text-transform: capitalize;
		list-style: none;
		padding: 10px;
		transition: 0.3s background ease;
		cursor: pointer;
	}
	li:hover {
		background: #f2f2f2;
	}
</style>
```

6. To output _search_ **anywhere** in the page (ie, pass the prop from child to parent):

Update script element of ```SearchList.svelte```: ```export let search = '';```
Update ```+page.svelte```:

```
<script>
////
    let search = '';
</script>

<SearchList {items} bind:search/>

```

And now _search_ is available anywhere, meaning one can output the search term in real time:

```
<h2>Search List</h2>
<h3>Search term: {search}</h3>
<SearchList {items} bind:search/>
```
