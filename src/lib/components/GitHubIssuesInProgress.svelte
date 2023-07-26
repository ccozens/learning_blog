<script lang="ts">
	import type { GitHubIssuesResponse } from '$lib/types';
	// api call is in src/routes/+page.server.ts
	export let issues: GitHubIssuesResponse = {
		issues: [],
	};

</script>

{#if issues.issues.length === 0}
	<p>No issues in progress</p>
{:else}
	<h2>Currently working on</h2>

	{#each issues.issues as issue}
		<a class="issue" href={issue.url} target="_blank">{issue.title}</a>
	{/each}
{/if}

<style>
	.issue::before {
		content: '👉 ';
	}

	.issue {
		display: block;
		margin-bottom: 1rem;
		text-decoration: none;
	}
</style>
