<!-- script -->
<script lang='ts'>
    import type { AllPosts } from '$lib/types';
	import TagCloud from './TagCloud.svelte';

    export let posts: AllPosts[] = [];
</script>

<!-- html -->


{#each posts as post}
    <article>
        <!-- note the /posts in the <a> element - makes it absolute link (/posts/slug) rather than relative (/posts/tags/posts/slug) -->
        <h1><a href="/posts/{post.slug}">{post.metadata.title}</a></h1>
        <p class="preview">{post.metadata.description}</p>
        <p>Posted on {post.dateFormatted}</p>
        <TagCloud tags={post.metadata.tags} />
    </article>
{/each}


<style>
    .preview {
        text-transform: capitalize;
    }
</style>