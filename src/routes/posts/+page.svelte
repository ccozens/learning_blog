<script lang="ts">
    import PostListWithPreview from '$lib/components/PostListWithPreview.svelte';
    export let data;
    const sortedPosts = data.sortedPosts;

</script>

<PostListWithPreview posts={sortedPosts} />
