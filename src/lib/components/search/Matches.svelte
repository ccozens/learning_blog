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
				<a href={match.slug}>
					<h3>{match.metadata.description}</h3>
				</a>
			</li>
		{/each}
	</ul>
{/if}
