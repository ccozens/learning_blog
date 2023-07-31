<script>
	import SinglePost from '$lib/components/SinglePost.svelte';
	import TagCloud from '$lib/components/TagCloud.svelte';
	export let data;
	// destructure props and create postContent object
	const { escapedContent, title, dateFormatted, tags } = data.postData;
	const postContent = { title, dateFormatted, escapedContent };

</script>

<SinglePost {postContent} />

{#if tags.length}
	<h2>Posted in:</h2>
	<TagCloud {tags} />
{/if}
