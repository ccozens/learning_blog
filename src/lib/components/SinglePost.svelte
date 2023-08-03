<script lang="ts">
	import '$lib/styles/code-prism-night-owl.css'; // theme for code blocks
	export let postContent;

	const { title, dateFormatted, escapedContent } = postContent;


<article>
	<h1>{title}</h1>
	<p>Posted on {dateFormatted}</p>
	<p>escapedContent</p>
	{@html escapedContent}

</article>
