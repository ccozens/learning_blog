<script lang="ts">
	// types
	import type { Post } from '$lib/types';
	// functions
	import { postSearch, formatSearchResult, normalizeSearch } from '$lib/functions/';
	// components
	import Matches from './Matches.svelte';
	import SearchBox from './SearchBox.svelte';

	export let items: Post[] = [];
	export let placeholder: string = 'search';
	export let keybind: string = 'k';
	let filteredSearch: Post[] = [];

	const extendedPlaceholder = `🔍 ${placeholder}`;
	let search = '';
	let isFocused = false;

	$: normalizedsearch = normalizeSearch(search);
	$: searchResults = postSearch(items, normalizedsearch);
	$: formattedSearch = formatSearchResult(searchResults, normalizedsearch);

	$: titleMatches = formattedSearch.titleMatches;
	$: descriptionMatches = formattedSearch.descriptionMatches;
	$: tagMatches = formattedSearch.tagMatches;
	$: contentMatches = formattedSearch.contentMatches;

	function clearSearch() {
		search = '';
		isFocused = false;
	}
</script>

<form>
	<SearchBox
		placeholder={extendedPlaceholder}
		bind:search
		bind:isFocused
		{clearSearch}
		{keybind}
	/>
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
		{#if titleMatches.length > 0}
			<Matches matches={titleMatches} heading="Title matches" />
		{/if}
		{#if descriptionMatches.length > 0}
			<Matches matches={descriptionMatches} heading="Description matches" />
		{/if}
		{#if contentMatches.length > 0}
			<Matches matches={contentMatches} heading="Content matches" />
		{/if}
		{#if tagMatches.length > 0}
			<Matches matches={tagMatches} heading="Tag matches" />
		{/if}
	</div>
{/if}

<style>
	.search-results {
		position: absolute;
		background-color: white;
		box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
		padding: 8px;
		z-index: 1000; /* Ensure popover is above other content */
	}
</style>
