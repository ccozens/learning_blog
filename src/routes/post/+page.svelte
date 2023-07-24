<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	const { title, description, tags } = data.frontmatter;
	const html = data.html;

</script>

<h1>You're here!</h1>

<h2>{title}</h2>
<h3>{description}</h3>
<div>{tags}</div>
{#if html}
	{@html html}
{:else}
	<p>loading...</p>
{/if}
