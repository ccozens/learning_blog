<script lang="ts">
	import type { Post } from '$lib/types';

	export let matches: Post[] = [];
	export let heading = '';
</script>

{#if matches.length > 0}
	<h2>{heading}</h2>
	<ul>
		{#each matches as match}
			<li>
				<a href="/posts/{match.slug}">
					<h2>{match.metadata.title}</h2>
				</a>
				<p>{match.metadata.description}</p>
			</li>
		{/each}
	</ul>
{/if}
