<script lang="ts">
	import { signIn, signOut } from '@auth/sveltekit/client';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import type { GitHubIssue } from '$lib/types';

	export let data: PageData;

	// filter data.issues for labels = in_progress
	const issues: GitHubIssue[] = data.issues.filter((issue: GitHubIssue) =>
		issue.labels.some((label) => label.name === 'in_progress')
	);

	/* The data for the current session in this example was made available through the $page store which
can be set through the root +page.server.ts file. It is not necessary to store the data there,
however, this makes it globally accessible throughout your application simplifying state management.
*/
</script>

<h1>You're ready: start doing</h1>

<h2>Currently working on</h2>

{#each issues as issue}
	<a class="issue" href={issue.html_url} target="_blank">{issue.title}</a>
{/each}

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
