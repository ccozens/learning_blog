---
title: 'sveltekit hooks'
date: '2023-07-04'
description: description
tags:
  - levelup
  - sveltekit
  - hooks
---
## [Hooks](https://levelup.video/tutorials/sveltekit/hooks)

A hook file can be client-only or server-only. There's no ```hooks.js``` that runs on both client and server.

### Why use hooks?
Usually to intersept a request, fetch call or error. Usually a request.
Why would you want to intercept every request? Often authentication - you want to get all the request info, check user auth status, log user in, and pass user's data into every single function in the svelte site. This means authentication can be done in one spot and the info passed to the whole of the rest of the site.

```hooks.server.js``` includes all the hooks, where ```hooks.client.js``` only includes error handling.

1. Create ```code src/hooks.server.js```. This is a special file as sveltekit is looking for it, and looks for specific named exports:
2. create handle function, which gives access to ```event```, and a ```resolve``` function:

```javascript
export function handle({ event, resolve }) {
    return resolve(event);
}
```

This boilerplate takes in an event, and returns the resolved event. There's *a lot* of info here:

```json
event {
  cookies: {
    get: [Function: get],
    getAll: [Function: getAll],
    set: [Function: set],
    delete: [Function: delete],
    serialize: [Function: serialize]
  },
  fetch: [AsyncFunction (anonymous)],
  getClientAddress: [Function: getClientAddress],
  locals: {},
  params: { num: '621' },
  platform: undefined,
  request: Request {
    [Symbol(realm)]: { settingsObject: [Object] },
    [Symbol(state)]: {
      method: 'GET',
      localURLsOnly: false,
      unsafeRequest: false,
      body: null,
      client: [Object],
      reservedClient: null,
      replacesClientId: '',
      window: 'client',
      keepalive: false,
      serviceWorkers: 'all',
      initiator: '',
      destination: '',
      priority: null,
      origin: 'client',
      policyContainer: 'client',
      referrer: 'client',
      referrerPolicy: '',
      mode: 'cors',
      useCORSPreflightFlag: false,
      credentials: 'same-origin',
      useCredentials: false,
      cache: 'default',
      redirect: 'follow',
      integrity: '',
      cryptoGraphicsNonceMetadata: '',
      parserMetadata: '',
      reloadNavigation: false,
      historyNavigation: false,
      userActivation: false,
      taintedOrigin: false,
      redirectCount: 0,
      responseTainting: 'basic',
      preventNoCacheCacheControlHeaderModification: false,
      done: false,
      timingAllowFailed: false,
      headersList: [HeadersList],
      urlList: [Array],
      url: [URL]
    },
    [Symbol(signal)]: AbortSignal { aborted: false },
    [Symbol(headers)]: HeadersList {
      cookies: null,
      [Symbol(headers map)]: [Map],
      [Symbol(headers map sorted)]: null
    }
  },
  route: { id: '/show/[num]' },
  setHeaders: [Function: setHeaders],
  url: URL {
    href: 'http://127.0.0.1:5173/show/621',
    origin: 'http://127.0.0.1:5173',
    protocol: 'http:',
    username: '',
    password: '',
    host: '127.0.0.1:5173',
    hostname: '127.0.0.1',
    port: '5173',
    pathname: '/show/621',
    search: '',
    searchParams: URLSearchParams {},
    hash: ''
  },
  isDataRequest: false,
  isSubRequest: false
}
```

- get, set, delete, serialize cookies allow you to implement auth
- fetch allow you go get data
- getClientAddress
- locals object for passing on data, eg the recommended way of passing user data is, after authenticating a user, pass user data into locals and its then availalble to rest of site
- params
- the actual request
- route
- setHeaders
- url

```return resolve(event)``` ensures the event is passed along to the next step in the app. Without out this, the code hits the handle function and stops, so this is always needed.


### Handle hook: mock authentication
Mock auth to show how it works without needing to bring third party into tutorial. Process nearly always the same: read cookie from http only cookie in request, and then authenticate the user.

So:
1. create ```code src/db/fake_auth.js``` and populate with fake user:


```javascript
export function auth() {
    return {
        id: 'whooooo',
        name: 'Casper',
        email: 'wh@ooooooo.com',
        roles: ['ghost'],
    }
}
```

2. Back to ```hooks.server.js```:

```javascript
import { auth } from '$db/fake_auth';

export function handle({ event, resolve }) {
    const user = auth();
    event.locals.user = user;
    event.locals.this_is_a_test = 'this is a test';
    return resolve(event);
}
```

This reads in auth, and sets events.locals.user to user.

3. Accessing locals:
Go to eg ```src/routes/show/[num]/+page.server.js``` and read in locals:

```javascript
export async function load({ fetch, params, setHeaders, locals }) {
    const res = await fetch(```https://syntax.fm/api/shows/${params.num}```);
    const data = await res.json();

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

4. After adding the return for user, this is now available to ```src/routes/show/[num]/+page.svelte``` too:

```javascript
<script>
	export let data;

	$: ({ episode, user } = data);
</script>

<h4>logged in as {user.name}</h4>
<h3>{episode.title}</h3>

<h4>{episode.number}</h4>

{@html episode.html}
```

To summarise: the request goes from client to hooks file, the hooks file does whatever it needs to, resolves the event and sends data to the next step, the data is then available in the load function (via locals) and you can do whatever you want.

#### Cookies
1. Simply call ```event.cookies.set```:

```javascript
export function handle({ event, resolve }) {
    event.cookies.set('flavour', 'chocolate chip')
    return resolve(event);
}
```

2. dev tools -> application -> cookies now has an extra cookie



## [Sequencing hooks and building a logger](https://levelup.video/tutorials/sveltekit/sequencing-hooks-and-building-a-logger)


### Sequencing
You can create hook functions and run them in sequence:

```javascript
import { auth } from '$db/fake_auth';

function logger({ event, resolve }) {
}

function authorize({ event, resolve }) {
    const user = auth();
    event.locals.user = user;
}

export function handle({ event, resolve }) {
    return resolve(event);
}
```

Here, nothing happens but logger and authorize functions are up and running. [Sveltekit's sequence helper function](https://kit.svelte.dev/docs/modules#sveltejs-kit-hooks-sequence) makes mutiple handle calls in a middleware-like manner:

```javascript
import { sequence } from '@sveltejs/kit/hooks';
import { auth } from '$db/fake_auth';

function logger({ event, resolve }) {
	  console.log(```[logger] ${event.request.method} ${event.url.pathname}```);
    return resolve(event);
}

function authorize({ event, resolve }) {
    const user = auth();
    event.locals.user = user;
    return resolve(event);
}

export const handle = sequence(logger, authorize);
```

Here, handle is now declared as a const that calls sequence, and that calls logger and then authorize (in that order). ```logger``` and ```authorize``` are now hooks, and so need to return ```resolve(event)``` to function.


### aysnc logger

Adapting logger to an async function:

```javascript
import { sequence } from '@sveltejs/kit/hooks';
import { auth } from '$db/fake_auth';


// runs first
async function logger({ event, resolve }) {
    const start_time = Date.now();
    console.log(```start_time: ${start_time}```);
    const response = await resolve(event);
    console.log(```[logger] ${event.request.method} ${event.url.pathname}```);
    return response;
}

// runs second
function authorize({ event, resolve }) {
    const user = auth();
    event.locals.user = user;
    return resolve(event);
}

export const handle = sequence(logger, authorize);
```

Here, logger is called first and *everything else* runs while awaiting ```const response = await resolve(event);```. So, the other hooks and load functions run while awaiting the response. That means we can access the response, and indeed time the response:

```javascript
async function logger({ event, resolve }) {
    const start_time = Date.now();
    const response = await resolve(event);
    console.log(```[logger] ${event.request.method} ${event.url.pathname}. Took ${Date.now() - start_time}ms```);    return response;
}

// prints [logger] GET /show/632. Took 1379ms
```


## handleFetch hook

The [handleFetch hook](https://kit.svelte.dev/docs/hooks#server-hooks-handlefetch) is a server only hook that allows you to intercept fetch requests and augment them, if necessary:

```javascript
// from the docs
export async function handleFetch({ request, fetch }) {
    if (request.url.startsWith('https://api.yourapp.com/')) {
        // clone the original request, but change the URL
        request = new Request(
            request.url.replace('https://api.yourapp.com/', 'http://localhost:9999/'),
            request
        );
    }

    return fetch(request);
}```


## handleError hook

The [handleError hook](https://kit.svelte.dev/docs/hooks#server-hooks-handleerror) is a shared (client and server) hook that intercepts unexpected errors and allows error logging and a custom error message for users.

```javascript
export function handleError({request, fetch}) {
    // may want to log error, eg logger(error, event)
    return {
        message: 'Oops I did it again',
        code: error.code
    }
}
```
