<script lang="ts">
	import type { GitHubIssue } from '$lib/types';

	// api call is in src/routes/+page.server.ts
	export let issues: GitHubIssue[] = [];
	// filter issues for open issues
	const openIssues = issues.filter((issue: GitHubIssue) => issue.state === 'open');
	// filter data.issues for labels = in_progress
	const issuesInProgress: GitHubIssue[] = openIssues.filter((issue: GitHubIssue) =>
		issue.labels.some((label) => label.name === 'in_progress')
	);
</script>

{#if issuesInProgress.length === 0}
	<p>No issues in progress</p>
{:else}
	<h2>Currently working on</h2>

	{#each issuesInProgress as issue}
		<a class="issue" href={issue.html_url} target="_blank">{issue.title}</a>
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
