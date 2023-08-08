<script lang="ts">
	//  types
	import type { PageData } from './$types';
	//  components
	import PostSearch from '$lib/components/search/PostSearch.svelte';
	//  data
	export let data: PageData;
	const { sortedPosts } = data;
</script>

<PostSearch items={sortedPosts} placeholder="Search posts" />

<slot />
