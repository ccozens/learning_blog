<!-- script -->
<script lang="ts">
	import type { Post } from '$lib/types';
	import TagCloud from './TagCloud.svelte';

	export let posts: Post[] = [];
</script>

<!-- html -->

{#each posts as post}
	<article>
		<!-- note the /posts in the <a> element - makes it absolute link (/posts/slug) rather than relative (posts/slug) -->
		<h1><a href="/posts/{post.slug}">{post.metadata.title}</a></h1>
		<p class="preview">{post.metadata.description}</p>
		<p>Posted on {post.dateFormatted}</p>
		<TagCloud tagString={post.metadata.tags} />
	</article>
{/each}

<style>
	.preview {
		text-transform: capitalize;
	}
</style>
