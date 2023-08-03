---
title: Throwing errors in Sveltekit
date: '2023-07-04'
description: description
tags:
  - levelup
  - sveltekit
  - errors
---
## [video](https://levelup.video/tutorials/sveltekit/throwing-errors)

Errors are about augmenting a user's journey through your site. For example:
- has a resource not loaded, or does it not exist?
- does a page exist, or do you need to be logged in to access it?


Expected errors: we checked this data, it doesn't exist, and so we're returning a 'data not found error'.

At its most simple, that's adding a console.log to ```src/routes/show/[num]/page.server.js```:

```javascript
export async function load({ fetch, params, setHeaders, locals }) {
    const res = await fetch(```https://syntax.fm/api/shows/${params.num}```);
    const data = await res.json();
    console.log('data', data );
    setHeaders({
        // 'Cache-Control': 'max-age=3600, s-maxage=86400'
        'Cache-Control': 'max-age=60'
    });

    console.log('locals', locals);

    return {
        episode: data,
        user: locals.user,
    };
}
```

If no page found, this logs: ```data { message: 'Sorry, we could not find show #900' }```.

A more sophisticated version is to:
1. check whether data.message exists
2. throw an error, using [sveltekit's error helper](https://kit.svelte.dev/docs/errors#expected-errors)

```javascript
import { error } from '@sveltejs/kit';

export async function load({ fetch, params, setHeaders, locals }) {
    const res = await fetch(```https://syntax.fm/api/shows/${params.num}```);
    const data = await res.json();

    if (data.message) {
        throw error(404, {
            message: data.message
        })
    }

    setHeaders({
        'Cache-Control': 'max-age=60'
    });

    console.log('locals', locals);

    return {
        episode: data,
        user: locals.user,
    };
}
```
This renders:
404
Sorry, we could not find show #900

In the context of the rest of the layout, and normal pages are unaffected as data.message does not exist.

This can be used to redirect users to a custom error page:

#[Error pages](https://levelup.video/tutorials/sveltekit/error-pages)

Error pages allow customisation of the error page content, when and where they show up. Guess what: ```+error``` files!

1. ```code src/routes/+error.svelte```
2. Error code:

```javascript
<script>
    import {page} from  '$app/stores';
    $: console.log('page', $page);
</script>

<h1>Oops</h1>
<h2>{$page.status}</h2>
<p>{$page.error?.message}</p>
```

This shows:
<h1>Oops</h1>
<h2>400</h2>
Sorry, we could not find show #900

\#900 because I went to ```http://127.0.0.1:5173/show/900``` to force an error (there aren't 900 shows yet).

## console logging from svelte stores:
``` $: console.log('page', $page);```
In svelte script tags, this needs to be a reactive statement, and need to ensure the page is marked as reactive as well, so that the function runs and the page data updates each time the page re-renders.

## Pages at different levels
Creating nested error pages is the same as nested layouts/etc, as any error thrown will look up the route tree for the closest error page. ie: ```code src/routes/show/[num]/+error.svelte``` will create a custom error page only shown in the individual show pages.

#[Redirects](https://levelup.video/tutorials/sveltekit/redirects)

[Redirects](https://kit.svelte.dev/docs/load#redirects) are used to redirect requests when someone has the wrong auth / access level, or are trying to access a moved resource.
Some redirects can impact SEO: eg 301 is a permanent redirect that tells Google a page has moved.
[Read the docs!](https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections)

Taking auth as an example, you could say: if user exists, let them access page or if not show an error.

In sveltekit, you throw redirect:

```javascript
import { error, redirect } from '@sveltejs/kit';

export async function load({ fetch, params, setHeaders, locals }) {
    const res = await fetch(```https://syntax.fm/api/shows/${params.num}```);
    const data = await res.json();

if (!locals?.user?.id) {
        throw redirect(307, '/')
}

    if (data.message) {
        throw error(404, {
            message: data.message
        })
    }

    setHeaders({
        'Cache-Control': 'max-age=60'
    });

    console.log('locals', locals);

    return {
        episode: data,
        user: locals.user,
    };
}
```

```if (!locals?.user?.id) {
        throw redirect(307, '/')
}```
means: return null if user or user.id are falsy, and if that happens then redirect, with [code 307](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/307), to homepage.

To test, update ```authorize``` in ```src/hooks.server.js```:

```javascript
function authorize({ event, resolve }) {
    const user = auth();
    // remove the part that adds user to events.locals.user
    // event.locals.user = user;
    return resolve(event);
}
```
