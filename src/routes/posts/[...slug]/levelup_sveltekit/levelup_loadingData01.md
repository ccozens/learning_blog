---
title: 'Sveltekit data: basic loading'
date: '2023-07-24'
description: description
tags:
  - levelup
  - sveltekit
  - data
---
Several ways of loading data in svelte. Usually in ```page.t/js``` file that lives in same folder as ```+page.svelte```:

## Intro
```
-routes
|
|- +page.svelte
|- +page.js
```

So:
1. create ```src/routes/+page.js```
2. Create load function:

```javascript
	export function load(): {hello: string;} {
	    return {
	        hello: 'world'
	    }
	}
```
3. Anything returned from load fn is automatically added as ```data``` prop: add ```export let data;``` to script tag in corresponding ```+page.svelte```:

```svelte
	<script>
	//...
	   export let data;
	</script>

	<h1>{data.hello}</h1>

```

'World' is sent from the server as HTML - this server-side renders data loaded from an API.
#### export
Remember ```export let data``` in script tag exports data as a component prop.

## Real API
This code makes a request to an API, passes it to a component and server-side renders the data.

1. Modify load function to async: ```export async function load```
2. Bring in fetch as a parameter: ```export async function load({ fetch })``` -> this brings in svelte's fetch function, which allows:
	- credentialled requests to be made on the server because it inherits cookie and auth headers from page request. This often doesn't matter for data requests, but does for PUT/POST requests
	- use of relative URLs in server-side requests. Usually need to be absolute URLs.
	- internal requests go directly to the handler when running on the server without making an HTTP call, so saves making a network request
	- during SSR, response captured and inlined into HTML and then read from HTML during hydration, again preventing an additional network request.
3. Make a request to syntax:

```javascript
	/** @type {import('./$types').PageLoad} */
export async function load({fetch}) {
    const res = await fetch('https://syntax.fm/api/shows/latest');
    const data = await res.json();
    console.log(data);
    return {
		// todo
    }
}
```

Remember: this data is available on both client and server, so logs to both consoles.

4. So, the complete request in ```+page.js```:

```/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
    const res = await fetch('https://syntax.fm/api/shows/latest');
    const data = await res.json();
    return {
        latest_episode: data
        ,
    }
}
```

5. And the client render in ```+page.svelte```:

```javascript
	<script>
	    export let data;
	</script>

	<h1>{data.latest_episode.title}</h1>


	<a href="/about">About</a>
```
