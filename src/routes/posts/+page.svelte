<script lang="ts">
    //  types
    import type { PageData } from './$types';
    //  components
    import PostListWithPreview from '$lib/components/PostListWithPreview.svelte';
    import TagCloud from '$lib/components/TagCloud.svelte';
    //  data
    import { page } from '$app/stores';


    export let data: PageData;
    $: sortedPosts = data.sortedPosts;

</script>



<PostListWithPreview posts={sortedPosts} />
<!-- <TagCloud tags={data.allTags} /> -->
