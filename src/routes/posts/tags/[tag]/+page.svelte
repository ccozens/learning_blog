<script lang="ts">
    export let data;
    const { tag, postsByTag } = data;
</script>

<h1>All posts for <span class="tagHeading">{tag}</span></h1>

{#each postsByTag as post}
<!-- note the /posts in the <a> element - makes it absolute link (/posts/slug) rather than relative (/posts/tags/posts/slug) -->
    <a href="/posts/{post.slug}">{post.metadata.title}</a>
    <p> {post.metadata.description}</p>
{/each}


<style>
    .tagHeading {
        text-transform: capitalize;
    }
</style>