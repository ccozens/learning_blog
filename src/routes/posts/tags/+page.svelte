<script lang="ts">
     import type { PageData } from './$types';
    import TagCloud from '$lib/components/TagCloud.svelte';

    export let data: PageData;
    const allTags = data.allTags;
</script>

<h1>all tags</h1>

<TagCloud tags={allTags} />
