<script lang="ts">
	import './codeThemeNightOwl.css'

	import type { PageData } from './$types';

	export let data: PageData;

	const { title, description, tags } = data.frontmatter;
	const html = data.html;

</script>


<h1>do I need to add slug param to markdown so I can have sensible URLs?</h1>


<h1>You're here!</h1>

<h2>{title}</h2>
<h3>{description}</h3>
<div>{tags}</div>

<p>Here's the content:</p>
{#if html}
	{@html html}
{:else}
	<p>loading...</p>
{/if}
