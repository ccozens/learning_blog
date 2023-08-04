---
title: Typing props in svelte
date: '2023-08-03'
description: typing props in sveltekit
tags:
  - levelup
  - sveltekit
  - typescript
---
## [video](https://levelup.video/tutorials/svelte-and-typescript/typing-props)

Props are how you pass data from one component to another.

1. Go to test component: ```src/lib/Test.svelte```
2. Add script:

```typescript
<script lang="ts">
</script>
```

3. To accept props in svelte, create an ```export let <var>```, eg:

```typescript
<script lang="ts">
	export let name;
</script>

<h1>{name}</h1>
```

4. Red squiggly! Type is note defined, meaning it is implicitly ```any```, which rather defeats the point in TS. So:

```typescript
<script lang="ts">
	export let name:string;
</script>

<h1>{name}</h1>
```

Note this makes this a required prop, as it is not set as optional.

5. Head to ```src/routes/+page.svelte```:

It has Test imported and ```<Test />``` rendered, with a TS error saying : ```Property 'name' is missing in type '{}' but required in type '{ name: string; }'```. So:

```typescript
<Test name={9} />
```
Now name is underlined and error is: Type 'number' is not assignable to type 'string'.
Note it does render as svelte renders the HTML, but TypeScript is complaining to show the potential bug. Here, this isn't an issue, but it could be,

```typescript
<Test name='Chris' />
```

Can also render as:

```typescript
<script lang="ts">
	import Test from '$lib/Test.svelte';
	import '$db/start';
	export let data;

	let name = 'Chris';
	$: ({ latest_episode } = data);
</script>

<h2>Latest Episode</h2>
<h3>{latest_episode.title}</h3>

<Test {name}/>
```

Here, TS infers that name is a string, and ```<Test {name} />``` is shorthand for ```<Test name={name} />```. Better for type safety, debuggin and perf is the explicit typing ```let name:string = 'Chris';```

##[Optional props](https://levelup.video/tutorials/svelte-and-typescript/optional-props)

Non-standard prop, eg a div with an expanded view: ```export let expanded: boolean```:

1. ```src/lib/Test.svelte```:

```typescript
<script lang="ts">
    export let name:string;
    export let expanded:boolean;
</script>

<h1>{name}</h1>

{#if expanded}
    <p>Expanded</p>
{/if}
```

2. ```<Test {name}/>``` in ```src/routes/+page.svelte``` now throws an error: ```Property 'expanded' is missing in type '{ name: string; }' but required in type '{ name: string; expanded: boolean; }'```.

3. Update Test component: ```export let expanded:boolean = false;```. Optional props must have a default value! This is useful as some code does not work with no value, eg:

```src/lib/Test.svelte```:

```typescript
<script lang="ts">
    export let list: string[];
</script>

{#each list as item}
    <p>{item}</p>
{/each}
```
This code does not render as ```Cannot read properties of undefined (reading 'length')
TypeError: Cannot read properties of undefined (reading 'length')```.

In other words, ```export let list: string[];``` is undefined! Adding a defualt value of empty array: ```export let list: string[] = [];```, means nothing renders but there is no error.
