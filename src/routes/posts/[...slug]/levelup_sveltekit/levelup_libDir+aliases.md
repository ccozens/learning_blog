---
title: 'Configuring aliases'
date: '2023-07-03'
description: description
tags:
  - levelup
  - sveltekit
  - aliases
---
Svelte supports aliased imports.
```lib``` comes pre-aliased:

1. create ```mkdir src/lib```
2. create ```code src/lib/Test.svelte```
3. in ```src/routes/+page.svelte```:

```svelte
	<script>
	    import Test from '$lib/Test.svelte';
	</script>

	<h1>Welcome to SvelteKit</h1>
	<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

	<a href="/about">About</a>

	<Test />
```

And test gets rendered!

However, while this works Code shows an error. Why?

### Configuring aliases
```jsconfig.json``` (or ```tsconfig.json``` if TypeScript).

This file has the comment:
```json
// Path aliases are handled by https://kit.svelte.dev/docs/configuration#alias and https://kit.svelte.dev/docs/configuration#files
	//
	// If you want to overwrite includes/excludes, make sure to copy over the relevant includes/excludes
	// from the referenced tsconfig.json - TypeScript does not merge them
```

It also states:
Top line here is: ```"extends": "./.svelte-kit/tsconfig.json",```

Heading there we see a compiler option is: ```"paths": {},```

Remember: .svelte-kit folder is a generated folder. So, stop and restart dev server and look again at ```"./.svelte-kit/tsconfig.json",``` and now, it has generated the alias:

```json
	"paths": {
			"$lib": [
				"../src/lib"
			],
			"$lib/*": [
				"../src/lib/*"
			]
		},
```

## lib vs routes
In the past, all files in routes/ was automatically a route, and so components were stored in /lib. Now, that's not the case, so:
*scoped components* live in their routes folder
*shared components* live in /lib with aliased paths

Vite does have its own alias system, but defining them in ```svelte.config.js``` is better as it gives svelte more control. For example adding the following ```alias``` option as per:

```svelte
	const config = {
		kit: {
			// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
			// If your environment is not supported or you settled on a specific environment, switch out the adapter.
			// See https://kit.svelte.dev/docs/adapters for more information about adapters.
			adapter: adapter(),
			alias: {
				$db: './src/lib/db',
			},
		}
	};
```

Then create ```code src/db/start.js``` with some code in:

```javascript
//start.js
console.log('start.js loading...')
```

and import to ```src/routes/+page.svelte``` via script tag:
```svelte
<script>
    import '$db/start';
</script>
```

This time, a script called ```svelte-kit sync``` picks up a change to the config server and restarts the dev server.
