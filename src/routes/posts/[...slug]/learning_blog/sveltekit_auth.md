---
title: 'SvelteKit auth using Auth.js'
date: '2023-07-31'
description: Enable auth in SvelteKit using Auth.js, with GitHub OAuth.
tags:
  - sveltekit
  - learning_blog
  - auth
---
#Auth using [Auth.js](https://authjs.dev/).

I wanted to enable auth in this project so I can have all data visible to anyone and only allow editing by me when I am logged in. I wanted a simple route so went for [Auth.js](https://authjs.dev/). Auth.js is an expanded version of [NextAuth](https://next-auth.js.org/), which I've used in the past, and there is a [sveltekit adaptor](https://authjs.dev/reference/sveltekit/). Currently (21 Jul 23) the docs have a huge flag on saying:

<div style="background-color:#4b1113; color:white; padding: 10px;">DANGER <br />
@auth/sveltekit is currently experimental. The API will change in the future.</div>

and feel incomplete, so I based my auth on the [vercel example hosted on GitHub](https://github.com/nextauthjs/sveltekit-auth-example) (live version [here](https://sveltekit-auth-example.vercel.app/)).

## The process.

1. First up, install: ```pnpm add @auth/core @auth/sveltekit```
2. Create **two** [Github OAuth apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app). This allows using different auth for dev and prod, and gets round GitHub only allowing one callback URL. The callback URL defaults to:

	```[origin]/auth/callback/[provider]```

	so I created:

   - _dev_: ```https://localhost:5173/auth/callback/github```
   - _prod_: ```https://learning-blog.teal.vercel.app/auth/callback/github```. Here, _https://learning-blog-teal.vercel.app/_ is the URL my project was deployed to before I moved to a named domain.


3. Record client id and client secret in ```.env```:

```javascript:.env
GITHUB_ID = '####'
GITHUB_SECRET = '####'
```

4. Create a random string 32 character for AUTH_SECRET ([online generator](https://generate-secret.vercel.app/32)) and add to ```.env```"

```javascript .env
GITHUB_ID = '####'
GITHUB_SECRET = '####'
AUTH_SECRET = '####'
```


5. Create and populate ```hooks.server.ts``` in the root dir:

```typescript:hooks.server.ts
import { SvelteKitAuth } from '@auth/sveltekit';
import GitHub from '@auth/core/providers/github';
import { GITHUB_ID, GITHUB_SECRET, AUTH_SECRET } from '$env/static/private';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = SvelteKitAuth(async () => {
	const authOptions = {
		providers: [
			GitHub({
				clientId: GITHUB_ID,
				clientSecret: GITHUB_SECRET
			})
		],
		secret: AUTH_SECRET,
		trustHost: true
	};
	return authOptions;
});
```

### What's going on here?
- imports are fairly standard, apart from `````` which is importing from ```.env' using [sveltekit's $env/static/private module](https://kit.svelte.dev/docs/modules#$env-static-private), which imports static variables and only runs server-side.
- [handle is a sveltekit hook](https://kit.svelte.dev/docs/hooks#server-hooks-handle) that runs wvery time the SvelteKit server receives a request. It is allows modification of response headers or bodies.
- when handle runs, it runs SvelteKitAuth, which specifies the auth providers (here, GitHub) and sets the ```clientId``` and ```clientSecret``` for authorisation by GitHub.
- ```secret```: is a optional parameter that is used to sign and verify authentication tokens. When a user logs in using GitHub, a token containing information about the user's auth status and permission scopes is generated. This is signed using the ```secret``` key and allows the SvelteKit app to validate the GitHub token.
- ```trustHost``` permits trusting hosts other than vercel. While this is a security risk, it allows logging in from localhost.
- ```return authOptions``` returns all the above data:

```json
authOptions {
  providers: [
    authOptions {
  id: 'github',
  name: 'GitHub',
  type: 'oauth',
  authorization: {
    url: 'https://github.com/login/oauth/authorize',
    params: { scope: 'read:user user:email' }
  },
  token: 'https://github.com/login/oauth/access_token',
  userinfo: {
    url: 'https://api.github.com/user',
    request: [AsyncFunction: request]
  },
  profile: [Function: profile],
  style: {
    logo: '/github.svg',
    logoDark: '/github-dark.svg',
    bg: '#fff',
    bgDark: '#24292f',
    text: '#000',
    textDark: '#fff'
  },
  options: {
    clientId: 'actual client id',
    clientSecret: 'actual client secret'
  }
}],
  secret: <AUTH_SECRET>,
  trustHost: true
}
```

4. Create and populate ```src/routes/+layout.server.ts```

Elements in a [SvelteKit layout file](https://kit.svelte.dev/docs/routing#layout) will display on every sibling and child page. As a ```+layout.server.ts``` file, [the load function will run on the server](https://kit.svelte.dev/docs/routing#layout-layout-server-js).

```typescript +layout.server.ts
import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async (event) => {
  return {
    session: await event.locals.getSession(),
  }
}
```

This load function is run automatically when the layout is loaded, and takes a server load event object as argument. This returns a session using ```getSession```, which is a SvelteKit function that returns a Promise - if authenticated, it returns user session data, or null if the user is not authenticated.

As this is a load funcion, the session data is now available globally via the [page.data object](https://kit.svelte.dev/docs/types#app-pagedata) of the [page store](https://kit.svelte.dev/docs/types#public-types-page), as ```page.data``` contains the merged data of all load functions in the app.

5. Create ```+layout.svelte```

This [sveltekit layout](https://kit.svelte.dev/docs/routing#layout-layout-svelte) provides client side layouts for every sibling and child page.

Importantly, this imports the [SvelteKit page store](https://kit.svelte.dev/docs/modules#$app-stores-page) and uses it to check for session data. It is not necessary to store the data there, however, this makes it globally accessible throughout your application simplifying state management.

```typescript:+layout.svelte
<script lang="ts">
	import { page } from '$app/stores';

  $: session = $page.data.session;
  $: image = $page.data.session?.user?.image;
  $: name = $page.data.session?.user?.name;

</script>

<div>
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
					<a href="/auth/signout" class="button" data-sveltekit-preload-data="off">Sign out</a>
				{:else}
					<span class="notSignedInText">You are not signed in</span>
					<a href="/auth/signin" class="buttonPrimary" data-sveltekit-preload-data="off">Sign in</a>
				{/if}
			</p>
		</div>
		<nav>
			<ul class="navItems">
				<li class="navItem"><a href="/">Home</a></li>
				<li class="navItem"><a href="/protected">Protected</a></li>
			</ul>
		</nav>
	</header>
	<slot />
</div>

<style>
	:global(body) {
		font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
			'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
			'Segoe UI Symbol', 'Noto Color Emoji';
		padding: 0 1rem 1rem 1rem;
		max-width: 680px;
		margin: 0 auto;
		background: #fff;
		color: #333;
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
		background: #ccc;
		border: 1px solid #ccc;
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
		background-color: transparent;
		color: #555;
	}
	.buttonPrimary {
		background-color: #346df1;
		border-color: #346df1;
		color: #fff;
		text-decoration: none;
		padding: 0.7rem 1.4rem;
	}
	.buttonPrimary:hover {
		box-shadow: inset 0 0 5rem rgba(0, 0, 0, 0.2);
	}
	.navItems {
		margin-bottom: 2rem;
		padding: 0;
		list-style: none;
	}
	.navItem {
		display: inline-block;
		margin-right: 1rem;
	}
</style>
```

This code generates a header showing a either:
- if not signed in: a message saying 'You are not signed in' and a _Sign in_ button
- if signed in: your GitHub avatar and a message saying 'Signed in as <your GitHub name>', and a _Sign out_ button.

It also so:
- generates a small nav with _Home_ and _Protected_ links, where _Protected_ can only be visited on login.
- adds CSS

6. Create ```+page.svelte```:

Content here not important - the [Auth.js demo](https://github.com/nextauthjs/sveltekit-auth-example/) contains:

```typescript +page.svelte
<h1>SvelteKit Auth Example</h1>
<p>
  This is an example site to demonstrate how to use <a
    href="https://kit.svelte.dev/">SvelteKit</a
  >
  with <a href="https://sveltekit.authjs.dev">SvelteKit Auth</a> for authentication.
</p>
```

7. Create ```src/routes/protected/+page.svelte``` and populate:

```typescript
<script lang="ts">
  import { page } from "$app/stores"
</script>

{#if $page.data.session}
	<h1>Protected page</h1>
	<p>
	  This is a protected content. You can access this content because you are
	  signed in.
	</p>
	<p>Session expiry: {$page.data.session?.expires}</p>
{:else}
	<h1>Access Denied</h1>
	<p>
	  <a href="/auth/signin">
	    You must be signed in to view this page
	  </a>
</p>
{/if}
```

This page uses an [Svelte if...else... expression](https://svelte.dev/docs/logic-blocks#if) to check for ```page.data.session```. If present it allows access, and if not shows a message saying _You must be signed in to view this page_. This is as simple as it is because _getSession()_ returns _null_ if authorization is incorrect.
