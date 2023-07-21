<script lang="ts">
	import type { Colour } from '$lib/types';

	export let colourData: Colour[] = [];

	// tells TS that field is a key of Colour and so can be used to index item (which is type Colour)
	export let field: keyof Colour;

	let search = '';

	$: regex = search ? new RegExp(search, 'i') : null;
	// $: matches = (item: Colour) => regex ? regex.test(item[field]) : true;
	$: matches = (item: Colour) => {
		if (field === 'both') {
			const nameMatch = regex ? regex.test(item.name) : true;
			const hexMatch = regex ? regex.test(item.hex) : true;
			return nameMatch || hexMatch;
		} else {
			return regex ? regex.test(item[field]) : true;
		}
	};
</script>

<div class="list">
	<label>
		Filter: <input bind:value={search} />
	</label>

	<div class="header">
		<slot name="header" />
	</div>

	<div class="content">
		{#each colourData.filter(matches) as item}
			<slot {item} />
		{/each}
	</div>
</div>

<style>
	.list {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.header {
		border-top: 1px solid var(--bg-2);
		padding: 0.2em 0;
	}

	.content {
		flex: 1;
		overflow: auto;
		padding-top: 0.5em;
		border-top: 1px solid var(--bg-2);
	}
</style>
