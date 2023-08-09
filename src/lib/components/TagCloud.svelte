<!-- script -->
<script lang="ts">
	import type { Tag } from '$lib/types';
	export let tags: Tag[] = [];
	export let tagString: string[] = [];
</script>

<!-- html -->

{#if tags.length === 0 && tagString.length === 0}
	<p>No tags yet.</p>
{/if}

<ul>
	{#if tagString}
		{#each tagString as tag}
			<li>
				<a href="tags/{tag}">
					{tag}
				</a>
			</li>
		{/each}
	{/if}

	{#each tags as tag}
		<li>
			<a href="tags/{tag.name}">
				{tag.name} ({tag.count})
			</a>
		</li>
	{/each}
</ul>
