<script lang="ts">
	import PostListWithPreview from '$lib/components/PostListWithPreview.svelte';

	export let data;
	const { allTags, tag, postsByTag } = data;
</script>

<h1>All posts for <span class="tagHeading">{tag}</span></h1>

<PostListWithPreview posts={postsByTag} />

<style>
	.tagHeading {
		text-transform: capitalize;
	}
</style>
