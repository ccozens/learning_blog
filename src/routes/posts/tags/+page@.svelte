<script lang="ts">
	// types
	import type { PageData } from './$types';
	// components
	import TagCloud from '$lib/components/TagCloud.svelte';
	import TagSearch from '$lib/components/search/TagSearch.svelte';

	export let data: PageData;
	const allTags = data.allTags;
</script>

<TagSearch items={allTags} placeholder="Search tags" keybind="k" />

<h1>All tags</h1>

<TagCloud tags={allTags} />
