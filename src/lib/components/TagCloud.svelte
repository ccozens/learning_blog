<!-- script -->
<script lang="ts">
	export let tags: string[] = [];
</script>

<!-- html -->

{#if tags.length === 0}
	<p>No tags yet.</p>
{/if}

<ul>
	{#each tags as tag}
		<li>
			<a href="tags/{tag}">
				{tag}
			</a>
		</li>
	{/each}
</ul>
