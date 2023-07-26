<script lang="ts">

    export let data;
    const sortedPosts = data.sortedPosts;
</script>

{#each sortedPosts as post}
    <article>
        <h1><a href="posts/{post.slug}">{post.metadata.title}</a></h1>
        <p>{post.metadata.description}</p>
        <p>Posted on {post.dateFormatted}</p>
        <ul>
            <!-- render tags -->
        </ul>
    </article>
{/each}