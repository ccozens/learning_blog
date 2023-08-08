<script lang="ts">
	import type { Tag } from '$lib/types';

	export let items: Tag[] = [];

	let search = '';
	let isFocused = false;

	$: filteredSearch = items.filter((item) => {
		if (search === '' && isFocused) {
			return [];
		}
		// return true if no search
		return (
			search === '' ||
			// or
			// return true if index is not -1
			item.name.indexOf(search) !== -1
		);
	});

	function clearSearch() {
		search = '';
		isFocused = false;
	}
</script>

<label>
	Search: <br />
	<input
		on:focus={() => (isFocused = true)}
		type="text"
		placeholder="search"
		bind:value={search}
	/>
</label>

{#if isFocused && search !== ''}
	{#if filteredSearch.length === 0}
		<p>No results found</p>
	{/if}

	{#if filteredSearch.length > 0}
		<button on:click={clearSearch}> clear </button>

		<div class="search-results">
			<ul>
				{#each filteredSearch as item}
					<li>
						<a href={`/posts/tags/${item.name}`}>{item.name}</a>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
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
