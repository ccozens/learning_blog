<!-- script -->
<script lang="ts">
	export let tags: string[] = [];
</script>

<!-- html -->

<ul>
	{#each tags as tag}
		<li><a href="tags/{tag}">{tag}</a></li>
	{/each}
</ul>
