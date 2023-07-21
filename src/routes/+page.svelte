<script lang="ts">
	import { signIn, signOut } from '@auth/sveltekit/client';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	export let data: PageData;

	// filter data.issues for labels = in_progress
	const issues = data.issues;

/* The data for the current session in this example was made available through the $page store which
can be set through the root +page.server.ts file. It is not necessary to store the data there,
however, this makes it globally accessible throughout your application simplifying state management.
*/
</script>

<h1>You're ready: start doing</h1>

<h2>Currently working on</h2>
<a href={issues[0].html_url} target="_blank" >{issues[0].title}</a>
