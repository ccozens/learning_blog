<script lang="ts">
	import '$lib/styles/code-prism-night-owl.css'; // theme for code blocks
	export let postContent;

	const { title, dateFormatted, escapedContent } = postContent;
</script>

<article>
	<h1>{title}</h1>
	<p>Posted on {dateFormatted}</p>
	{@html escapedContent}

</article>
