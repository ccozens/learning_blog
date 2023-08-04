<script>
	import SinglePost from '$lib/components/SinglePost.svelte';
	import TagCloud from '$lib/components/TagCloud.svelte';
	export let data;
	// destructure props and create postContent object
	const { escapedContent, title, dateFormatted, tags } = data.postData;
	const postContent = { title, dateFormatted, escapedContent };

	// destructure props and create postContent object from sortedPosts and params
	/* const post  = data.sortedPosts.find((post) => post.slug === data.params.slug);
	if (!post) return; // add this line to handle the case where post is undefined
	const { escapedContent, title, dateFormatted, tags } = post;
		(post) => post.slug === data.params.slug
	).postData; */
</script>

<SinglePost {postContent} />

{#if tags.length}
	<h2>Posted in:</h2>
	<TagCloud {tags} />
{/if}
