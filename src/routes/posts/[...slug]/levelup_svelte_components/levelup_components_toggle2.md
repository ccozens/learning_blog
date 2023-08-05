---
title: Advanced toggle
date: '2023-08-03'
description: More on toggles
tags:
    - levelup
    - sveltekit
    - components
---

#[Advanced toggle](https://levelup.video/tutorials/building-svelte-components/a-more-configurable-toggle)

The basic toggle has some CSS issues, so need to add box sizing border box to everything.

So: create layout to wrap around index and a CSS file to import:

1. `src/routes/+layout.svelte`
2. Contents:

```
<script>
    import '$lib/style.css';
</script>


<slot />
```

3. And create `src/lib/style.css` with styles to reset border box sizing:

```css
html {
	box-sizing: border-box;
}

*,
*::before,
*::after {
	box-sizing: inherit;
}
```

> This can also be done by creating global styles in the `+layout.svelte`:
>
> ```
> <style>
> 	:global(html) {
> 		box-sizing: border-box;
> 		}
> </style>
> ```

4. Toggle now sits too low and too far left in box, so either tweak sizing or positioning of `.toggle::after`:

```
.toggle::after {
		content: '';
		position: absolute;
		top: -1px;  /* updated */
		left: -1px;  /* updated */
		width: var(--height);
		height: var(--height);
		border-radius: var(--radius);
		background-color: aliceblue;
		box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.3);
		transition: transform 0.2s ease-in-out;
	}
```

5. Update the `label` style in `Toggle.svelte` to be a flexbox:

```
label {
		--width: 40px;
		--height: calc(var(--width) / 2);
		--radius: calc(var(--height) / 2);
        display: flex;   /* updated */
        gap: 5px;   /* updated */
	}
```

This automatically places the label text next to the toggle and slider with a small gap between lavel and slider.

##Add functionality to toggle

1. In `+page.svelte`:

```
<script>
    import Toggle from "$lib/Toggle.svelte";

    let isToggled = false;
</script>

<h1>Welcome to Level UI</h1>

<Toggle {isToggled}/>
```

Toggle now has property isToggled set to value of isToggled, which defaults to false.

2. In `Toggle.svelte`, create a script tag with prop _isToggled_, with default value of false:

```
<script>
    export let isToggled = false;

</script>
```

3. Set checked (a [standard checkbox HTML property](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox)) to the value of isToggled:

```
<label>
	<input type="checkbox" checked={isToggled}/>
	<div class="toggle" />
	Label
</label>
```

4. Write some logic in `+page.svelte` markup section:

```
{#if isToggled}
    <h1>I'm toggled</h1>
{/if}
```

5. To make it interactive, [bind the property to the element](https://svelte.dev/docs/element-directives#bind-property).

    1. In `+page.svelte` replace `<Toggle {isToggled}/>` with: `<Toggle bind:isToggled={isToggled}/>`. On save, this automatically updates to shorthand: `<Toggle bind:isToggled />`
    2. In `Toggle.svelte`: replace `<input type="checkbox" checked={isToggled}/>` with `<input type="checkbox" bind:checked={isToggled}/>`.

6. Update label from fixed to a prop to pass in. In `Toggle.svelte`:

```
<script>
    export let isToggled = false;
    export let label = ''; // updated
</script>

<label>
	<input type="checkbox" bind:checked={isToggled}/>
	<div class="toggle" />
	{label}  <!-- updated -->
</label>
```

And in `+page.svelte`, pass in a label: `<Toggle bind:isToggled label="switch"/>`.

7. Ditto colours. Note this works for all the variables. The [CSS variable function](https://developer.mozilla.org/en-US/docs/Web/CSS/var) takes a second value, so can set a variable as first param and fixed (eg _aliceblue_) as default.

```css
.toggle::after {
 ...
 background-color: var(--toggleButtonColour, aliceblue);
 ...
 }
```

8. We can now use CSS variables to make this configurable:
   a . In `+page.svelte`, duplicate toggle and add style: `<Toggle bind:isToggled label="switchy switch" style="--toggleBackgroundColour: red;">`
   b. In `Toggle.svelte`, [create a new component prop](https://svelte.dev/docs/svelte-components#script-1-export-creates-a-component-prop) with default empty string, and pass it into label:

```
<script>
    export let isToggled = false;
    export let label = '';
    export let style = '';
</script>

<label {style}>
...
```

Now, first toggle is default green and second toggle is green, because the _.toggle_ css definition says: `background-color: var(--toggleBackgroundColour, green);`

Same for _.toggle_ and _.input:checked + .toggle_, and note these chain:

```
<script>
	import Toggle from '$lib/Toggle.svelte';

	let isToggled = false;
</script>

<h1>Welcome to Level UI</h1>

<Toggle bind:isToggled label="switch" />
<Toggle
	bind:isToggled
	label="switchy switch"
	style="--toggleBackgroundColour: red; --toggleCheckedBackgroundColour: green;
--toggleButtonColour: navy"
/>

{#if isToggled}
	<h1>I'm toggled</h1>
{/if}
```
