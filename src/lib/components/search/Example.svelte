<script lang="ts">
	import { onMount } from 'svelte';
	let items = ['james', 'chris', 'vicky', 'fiona', 'paul', 'jennifer', 'john', 'jane'];
	let search = '';
	let isFocused = false;

	$: filteredSearch = items.filter((item) => {
		// return true if no search
		return (
			search === '' ||
			// or
			// return true if index is not -1
			item.indexOf(search) !== -1
		);
	});
</script>

<label>
	Search Names: <br />
	<input
		on:focus={() => (isFocused = true)}
		type="text"
		placeholder="search"
		bind:value={search}
	/>
</label>

{#if isFocused}
	<ul>
		{#each filteredSearch as item}
			<li
				class="list-item"
				tabindex="0"
				on:click={() => {
					search = item;
				}}
			>
				<a href="#">{item}</a>
			</li>
		{/each}
	</ul>
{/if}

<style>
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	li {
		padding: 0.5rem;
	}

	li:hover {
		background-color: yellow;
	}
	li:focus {
		background-color: #eee;
	}
</style>
