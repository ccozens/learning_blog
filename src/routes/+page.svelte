<script lang="ts">
	import GitHubIssuesInProgress from '$lib/components/GitHubIssuesInProgress.svelte';
	import type { GitHubIssuesResponse } from '$lib/types';
	import { signIn, signOut } from '@auth/sveltekit/client';
	import type { PageData } from './$types';


	export let data: PageData;

	const { issues } = data;

	/* The data for the current session was made available through the $page store which can be set through the root +page.server.ts file. It is not necessary to store the data there, however, this makes it globally accessible throughout your application simplifying state management.
	 */
</script>

<h1>You're ready: start doing</h1>

<GitHubIssuesInProgress {issues} />
