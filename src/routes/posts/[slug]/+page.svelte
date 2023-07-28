<script>
	import SinglePost from '$lib/components/SinglePost.svelte';
	import TagCloud from '$lib/components/TagCloud.svelte';
	export let data;
	// destructure props and create postContent object
	const { content, title, dateFormatted, tags } = data.postData;
	const body = content.html;
	const postContent = { title, dateFormatted, body };
</script>

<SinglePost {postContent} />

{#if tags.length}
	<h2>Posted in:</h2>
	<TagCloud {tags} />
{/if}
