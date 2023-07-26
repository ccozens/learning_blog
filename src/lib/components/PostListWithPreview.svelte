<!-- script -->
<script lang='ts'>

import type { AllPosts } from '$lib/types';

    export let posts: AllPosts[] = [];


</script>

<!-- html -->


{#each posts as post}
    <article>
        <!-- note the /posts in the <a> element - makes it absolute link (/posts/slug) rather than relative (/posts/tags/posts/slug) -->
        <h1><a href="posts/{post.slug}">{post.metadata.title}</a></h1>
        <p>{post.metadata.description}</p>
        <p>Posted on {post.dateFormatted}</p>
        <ul>
            <!-- render tags -->
        </ul>
    </article>
{/each}