<script lang="ts">
	//  types
	import type { PageData } from './$types';
	//  components
	import PostListWithPreview from '$lib/components/PostListWithPreview.svelte';
	import TagCloud from '$lib/components/TagCloud.svelte';

	//  data
	export let data: PageData;
	const { sortedPosts, allTags } = data;
</script>

<PostListWithPreview posts={sortedPosts} />
<TagCloud tags={allTags} />
