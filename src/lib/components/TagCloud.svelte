<!-- script -->
<script lang="ts">
	import type { Tag } from '$lib/types';
	export let tags: Tag[] = [];
	export let tagString: string[] = [];

	if (tagString.length > 0) {
		tagString.forEach((tag) => tags.push({ name: tag, count: 0 }));
	}
</script>

<!-- html -->

{#if tags.length === 0 && tagString.length === 0}
	<p>No tags yet.</p>
{/if}

<ul>
	{#each tags as tag}
		<li>
			<a href="/posts/tags/{tag.name}">
				{tag.name}
				{#if tag.count > 0}
					({tag.count})
				{/if}
			</a>
		</li>
	{/each}
</ul>
