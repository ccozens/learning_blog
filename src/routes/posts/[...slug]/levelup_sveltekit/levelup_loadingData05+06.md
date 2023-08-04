---
title: 'Sveltekit data: server only loading'
date: '2023-07-03'
description: Intro to server only loading in sveltekit
tags:
  - levelup
  - sveltekit
  - data
---
## [Server only loading video](https://levelup.video/tutorials/sveltekit/server-only-loading)

1. Any time you want to do data loading on the server only, simply change ```page.js``` to ```page.server.js``` (same for layout). Initially, this causes the page to crash until reloaded, as this page is now only being rendered on the server.


	### What's happening?
	With ```page.js```, loading up a page makes a request directly to the external api (here, syntax).
	With ```page.server.js```, the client makes a request to a local API, and the server then makes a request to syntax.

	Looking at devtools -> Network -> Fetch/XHR -> select a request -> Request URL:
	```page.js```: https://syntax.fm/api/shows/625
	```page.server.js```:
http://127.0.0.1:5173/show/618/__data.json?x-sveltekit-invalidated=01

	#### Why?
	1. this gives control over requests to the external API, eg you can cache the external request after your server request and make local requests to your cached data
	2. reduces database calls, as can make server request to external DB and cache data for client requests.
	3. doing operations that can only be done server side.

Functionally, there is a very small hit to performance.


## [setHeaders and Caching](https://levelup.video/tutorials/sveltekit/setheaders-and-caching)

[setHeaders](https://kit.svelte.dev/docs/load#cookies-and-headers) is another option in [load](https://kit.svelte.dev/docs/load), and can be used anywhere in load function before the return:

```javascript
export async function load({ fetch, setHeaders }) {
    const url = ```https://cms.example.com/products.json```;
    const response = await fetch(url);

    // cache the page for the same length of time
    // as the underlying data
    setHeaders({
        age: response.headers.get('age'),
        'cache-control': response.headers.get('cache-control')
    });

    return response.json();
}
```

setHeaders sets headers on the response of the request.
eg: ```'Cache-Control': 'max-age=60'``` sets the cache control header to cache for 60 seconds.
Does this make a difference?
Looking at page load time (dev tools -> network -> Fetch/XHR), typical size is 5-10 kb and response times are ~200ms. When cached, size is 'disc cache' and time is 1ms.


Note these are ```page.server.js``` headers. You can set headers in ```page.js``` but be awre it doesn't do anything client-side. Client-side cache headers are set for requests to our own server, and requests from client to external API are set by the external API.
