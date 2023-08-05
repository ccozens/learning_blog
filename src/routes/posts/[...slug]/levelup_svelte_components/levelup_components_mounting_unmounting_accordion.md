---
title: Accordion with Mounting and Unmounting
date: '2023-08-03'
description: Mounting and unmounting components
tags:
    - levelup
    - sveltekit
    - components
---

#[Accordion with Mounting and Unmounting](https://levelup.video/tutorials/building-svelte-components/accordion-with-mounting-and-unmounting)

2 different, completely viable approaches: using [Svelte's transitions](https://svelte.dev/docs/svelte-transition) and CSS.

##Svelte's transitions
This method is easy but it mounts and unmounts from the DOM - ie, when you close the accordion the HTML for the inner text is _removed from the DOM_. As the accordion is closed by default, the children are not mounted in the SSR side, so Google won't be able to index it, as the HTML won't be rendered until there is a user interaction.

1. Create `src/lib/Accordion.svelte`
2. Setup props and layout:

```
<script>
    export let buttonText = "";
    export let isOpen = true;
</script>

<div>
	<button>{buttonText}</button>
	<div>
		<slot />
	</div>
</div>
```

-   buttonText is for the header text
-   isOpen marks whether the accordion is open or not
-   slot is for the accordion content
-   divs are wrappers

2. [slide transition using svelte](https://svelte.dev/docs/svelte-transition#slide):

```
<script>
    import { slide } from 'svelte/transition';
	export let buttonText = '';
	export let isOpen = true;
</script>

<div>
	<button>{buttonText}</button>
	<div transition:slide>
		<slot />
	</div>
</div>
```

3. Wrap the div surrounding the transition and slot in an if clause:

```
<div>
	<button>{buttonText}</button>
    {#if isOpen}
	<div transition:slide>
		<slot />
	</div>
    {/if}
</div>
```

4. Add [functionality to the button](https://svelte.dev/docs/element-directives#on-eventname):

```
<button on:click={() => (isOpen = !isOpen)}>
        {buttonText}
</button>
```

5. Take a look! In `+page.svelte`:

```
<script>
    import Accordion from '$lib/Accordion.svelte';
</script>

<Accordion isOpen={true} buttonText="Accordion text">
	<!-- slot content -->
    <div>
        <p>yeah</p>
        <p>whoop</p>
    </div>
</Accordion>
```

##Accordion using CSS and Svelte actions
