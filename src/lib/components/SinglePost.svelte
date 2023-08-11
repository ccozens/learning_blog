<script lang="ts">
	import '$lib/styles/code-prism-night-owl.css'; // theme for code blocks
	import '$lib/styles/markdown.css';
	export let postContent;

	const { title, dateFormatted, escapedContent } = postContent;
</script>

<article>
	<!-- this silences errors from markdown a elements used for ToC -->
	<!-- svelte-ignore a11y-missing-content-->
	<h1>{title}</h1>
	<p>Posted on {dateFormatted}</p>
	{#if escapedContent}
		{@html escapedContent}
	{:else}
		<p>loading...</p>
	{/if}
</article>
