<script lang="ts">
	//  types
	import type { PageData } from './$types';
	//  components
	import PostSearch from '$lib/components/search/PostSearch.svelte';
	import PostListWithPreview from '$lib/components/PostListWithPreview.svelte';
	import TagCloud from '$lib/components/TagCloud.svelte';
	// functions
	import { postSearch } from '$lib/functions/';
	//  data
	export let data: PageData;

	const { sortedPosts, allTags } = data;
</script>

<PostSearch items={sortedPosts} placeholder="Search posts" />
<PostListWithPreview posts={sortedPosts} />
<TagCloud tags={allTags} />
