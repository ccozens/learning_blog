<script lang="ts">
	import Nav from '$lib/components/Nav.svelte';
	import { page } from '$app/stores';

	$: currentPath = $page.route.id;
	$: session = $page.data.session;
	$: image = $page.data.session?.user?.image;
	$: name = $page.data.session?.user?.name;

	// Initialize a writable store to handle errors
	import { writable } from 'svelte/store';
	export const error = writable(null);

	// load path data for nav
	export let data;
	const navItems = data.navItems;
</script>

<header>
	<div class="signedInStatus">
		<p class="nojs-show loaded">
			{#if session}
				{#if image}
					<span style="background-image: url('{image}')" class="avatar" />
				{/if}
				<span class="signedInText">
					<small>Signed in as</small>
					<strong>{name}</strong>
				</span>
				<a href="/auth/signout" class="button" data-sveltekit-preload-data="off">Sign out</a
				>
			{:else}
				<span class="notSignedInText">You are not signed in</span>
				<a href="/auth/signin" class="buttonPrimary" data-sveltekit-preload-data="off"
					>Sign in</a
				>
			{/if}
		</p>
	</div>
	<Nav {navItems} {currentPath} />
</header>
<slot />

{#if $error}
	<p>Error</p>
	<pre>{$error.message}</pre>
{/if}

<style>
	:global(body) {
		font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
			'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
			'Segoe UI Symbol', 'Noto Color Emoji';
		padding: 0 1rem 1rem 1rem;
		max-width: 680px;
		margin: 0 auto;
		background: #080771;
		color: #0ff3e4;
	}
	:global(li),
	:global(p) {
		line-height: 1.5rem;
	}
	:global(a) {
		font-weight: 500;
	}
	:global(hr) {
		border: 1px solid #ddd;
	}
	:global(iframe) {
		background: #0ff3e4;
		border: 1px solid #0ff3e4;
		height: 10rem;
		width: 100%;
		border-radius: 0.5rem;
		filter: invert(1);
	}

	.nojs-show {
		opacity: 1;
		top: 0;
	}
	.signedInStatus {
		display: block;
		min-height: 4rem;
		width: 100%;
	}
	.loaded {
		position: relative;
		top: 0;
		opacity: 1;
		overflow: hidden;
		border-radius: 0 0 0.6rem 0.6rem;
		padding: 0.6rem 1rem;
		margin: 0;
		background-color: rgba(0, 0, 0, 0.05);
		transition: all 0.2s ease-in;
	}
	.signedInText,
	.notSignedInText {
		position: absolute;
		padding-top: 0.8rem;
		left: 1rem;
		right: 6.5rem;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
		display: inherit;
		z-index: 1;
		line-height: 1.3rem;
	}
	.signedInText {
		padding-top: 0rem;
		left: 4.6rem;
	}
	.avatar {
		border-radius: 2rem;
		float: left;
		height: 2.8rem;
		width: 2.8rem;
		background-color: white;
		background-size: cover;
		background-repeat: no-repeat;
	}
	.button,
	.buttonPrimary {
		float: right;
		margin-right: -0.4rem;
		font-weight: 500;
		border-radius: 0.3rem;
		cursor: pointer;
		font-size: 1rem;
		line-height: 1.4rem;
		padding: 0.7rem 0.8rem;
		position: relative;
		z-index: 10;
		background-color: #0ff3e4;
		color: #555;
	}
	.buttonPrimary {
		background-color: #0ff3e4;
		border-color: #0ff3e4;
		color: #080771;
		text-decoration: none;
		padding: 0.7rem 1.4rem;
	}
	.buttonPrimary:hover {
		box-shadow: inset 0 0 5rem rgba(0, 0, 0, 0.2);
	}

	:global(a) {
		color: #0ddacd;
	}
</style>
