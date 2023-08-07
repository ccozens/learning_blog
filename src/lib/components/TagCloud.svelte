<!-- script -->
<script lang="ts">
	import type { Tag } from '$lib/types';
	export let tags: Tag[] = [];
</script>

<!-- html -->

{#if tags.length === 0}
	<p>No tags yet.</p>
{/if}

<ul>
	{#each tags as tag}
		<li>
			<a href="tags/{tag}">
				{tag.name} ({tag.count})
			</a>
		</li>
	{/each}
</ul>
