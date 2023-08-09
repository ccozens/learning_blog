<script lang="ts">
	// types
	import type { PageData } from './$types';
	// components
	import TagCloud from '$lib/components/TagCloud.svelte';
	import TagSearch from '$lib/components/search/TagSearch.svelte';
	import Example from '$lib/components/search/Example.svelte';

	export let data: PageData;
	const allTags = data.allTags;
</script>

<Example />

<TagSearch items={allTags} placeholder="Search tags" keybind="k" />

<h1>All tags</h1>

<TagCloud tags={allTags} />
