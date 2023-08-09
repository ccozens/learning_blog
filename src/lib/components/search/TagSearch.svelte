<script lang="ts">
	// types
	import type { Tag } from '$lib/types';
	// functions
	import { tagSearch, normalizeSearch } from '$lib/functions/';
	// components
	import SearchBox from './SearchBox.svelte';

	export let items: Tag[] = [];
	export let placeholder: string = 'search';
	export let keybind: string = 'k';
	let filteredSearch: Tag[] = [];

	const extendedPlaceholder = `🔍 ${placeholder}`;
	let search: string = '';
	let isFocused: Boolean = false;

	// child function
	let clearSearch = () => {};

	$: normalizedsearch = normalizeSearch(search);
	$: searchResults = tagSearch(items, normalizedsearch);
</script>

<form>
	<SearchBox placeholder={extendedPlaceholder} bind:search bind:isFocused {keybind} />

	<div class="shortcut">
		<kbd>⌘</kbd>
		<kbd>{keybind.toUpperCase()}</kbd>
	</div>
</form>

{#if isFocused}
	<button on:click={clearSearch}> clear </button>
{/if}

{#if isFocused && search !== ''}
	{#if filteredSearch.length === 0}
		<p>No results found</p>
	{/if}

	<div class="search-results">
		{#if searchResults instanceof Array}
			<ul>
				{#each searchResults as item}
					<li>
						<a href="/posts/tags/{item.name}">{item.name}</a>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
{/if}

<style>
	li {
		text-transform: capitalize;
	}

	.search-results {
		position: absolute;
		background-color: white;
		box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
		padding: 8px;
		z-index: 1000; /* Ensure popover is above other content */
	}
</style>
