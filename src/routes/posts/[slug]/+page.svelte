<script>
	import SinglePost from '$lib/components/SinglePost.svelte';

	export let data;
	// destructure props and create postContent object
	const { content, title, dateFormatted, tags } = data.postData;
	const body = content.html;
	const postContent = { title, dateFormatted, body };
</script>

<SinglePost { postContent }/>

{#if tags.length}
	<aside>
		<h2>Posted in:</h2>
		<ul>
			{#each tags as tag}
				<li>
					<a href="/posts/tag/{tag}">
						{tag}
					</a>
				</li>
			{/each}
		</ul>
	</aside>
{/if}
