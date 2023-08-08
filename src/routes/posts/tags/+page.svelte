<script lang="ts">
	import type { PageData } from './$types';
	import TagCloud from '$lib/components/TagCloud.svelte';
	import SearchList from '$lib/components/search/SearchList.svelte';

	export let data: PageData;
	const allTags = data.allTags;
</script>

<SearchList items={allTags} placeholder="Search tags" />

<h1>all tags</h1>

<TagCloud tags={allTags} />
