<script>
	import { signIn, signOut } from '@auth/sveltekit/client';
	import { page } from '$app/stores';

/* The data for the current session in this example was made available through the $page store which
can be set through the root +page.server.ts file. It is not necessary to store the data there,
however, this makes it globally accessible throughout your application simplifying state management.
*/
</script>

<h1>SvelteKit Auth Example</h1>
<p>
	{#if $page.data.session}
		{#if $page.data.session.user?.image}
			<span style="background-image: url('{$page.data.session.user.image}')" class="avatar" />
		{/if}
		<span class="signedInText">
			<small>Signed in as</small><br />
			<strong>{$page.data.session.user?.name ?? 'User'}</strong>
		</span>
		<button on:click={() => signOut()} class="button">Sign out</button>
	{:else}
		<span class="notSignedInText">You are not signed in</span>
		<button on:click={() => signIn('github')}>Sign In with GitHub</button>
	{/if}
</p>
