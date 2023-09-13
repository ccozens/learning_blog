---
title: CSS variables in svelte
description: An exploration of different ways to use them in svelte, including passing them into components and reactivity.
date: 2023-09-11
tags:
    - css
    - css variables
    - custom properties
    - svelte
---

## Using CSS variables in svelte

### Basics

This method is in a [svelte REPL called 'CSS variables'](https://svelte.dev/repl/4b1c649bc75f44eb9142dadc0322eccd?version=3.6.7). Simply create a variable in script tag, declare `style="--theme-color: {color}"` as an HTML attribute, and use the variable in CSS with `var(--theme-color)`.

```html
<script>
	let color = '#ff3e00';
</script>

<div style="--theme-color: {color}">
	<p>the color is set using a CSS variable</p>
</div>

<style>
	p {
		color: var(--theme-color);
	}
</style>
```

### The style element directive

Above, the `style` attribute is used to pass in a CSS variable. Svelte provides a [style directive](https://svelte.dev/docs/element-directives#style-property), which takes precedence over the style attribute.

```html
<!-- These are equivalent -->
<div style="color: red;">HTML attribute</div>
<div style:color="red">Svelte style directive</div>

<!-- directives take precendece -->
<div style="color: blue;" style:color="red">This will be red</div>
```

#### Using variables with the style directive

As with passing props to components, the style directive can be used to pass in variables and shorthand can be used if the variable name is the same as the CSS property name:

```html
<!-- Variables can be used -->
<div style:color="{myColor}">...</div>

<!-- Shorthand, for when property and variable name match -->
<div style:color>...</div>
```

#### Multiple styles need multiple directives:

```html
<!-- Multiple styles can be included -->
<div
    style:color
    style:width="12rem"
    style:background-color={darkMode ? 'black' : 'white'}>
    ...
    </div>
```

### Passing CSS variables into components

The `<div style="--theme-color: {color}">` syntax is the [svelte style directive](https://svelte.dev/docs/component-directives#style-props).
, and can be used to pass styles as props to components, including overwriting CSS variables.

Here we have a button with a CSS variable that is passed into the component:

```typescript
<!-- script -->
<script lang='ts'>
    export let buttonColor = '#e97aeb';
</script>

<!-- html -->

<button style="--button-color: {buttonColor}">Button</button>

<style>
    button {
        background-color: var(--button-color);
    }
</style>
```

And in the page that uses the component, we can change the color of the button by passing in a different value for the buttonColor prop:

```html
<!-- script -->
<script lang="ts">
	import Button from '$lib/components/Button.svelte';
</script>

<!-- This button is the colour defined in the Button component -->
<button />
<!-- This button is the colour passed in -->
<button buttonColor="#ff3e00" />
<button buttonColor="#00ff3e" />
```

## Reactivity

CSS variables can be used to dynamically alter the appearance of a component.

### Changing CSS variables in JavaScript

Here, an input element serves as a colour picker with the value of the input element bound to the color variable. The color variable is then used to set the value of the CSS variable.

```html
<script>
	let color = '#ff3e00';
</script>

<div style="--theme-color: {color}">
	<p>the color is set using a CSS variable</p>
</div>

<input type="color" bind:value="{color}" style="height: 50px;" />

<style>
	p {
		color: var(--theme-color);
	}
</style>
```

### Changing CSS variables in Svelte

Here, the input element is replaced with a slider, and the value of the slider is used to set the value of the CSS variable.

```html
<script>
	let hue = 0;
</script>

<div style="--theme-color: hsl({hue}, 100%, 50%)">
	<p>the color is set using a CSS variable</p>
</div>

<input type="range" min="0" max="360" bind:value="{hue}" style="height: 50px;" />

<style>
	p {
		color: var(--theme-color);
	}

	input {
		width: 100%;
	}

	div {
		height: 100px;
		width: 100%;
	}
</style>
```

### Updating CSS variables from a component

Here, the slider is replaced with a component that takes a hue prop and uses it to set the value of the CSS variable.

```html
<!-- Slider.svelte -->
<script lang="ts">
	export let hue = 0;
</script>

<input type="range" min="0" max="360" bind:value="{hue}" />
```

```html
<script>
	import Slider from '$lib/components/Slider.svelte';
</script>

<script lang="ts">
	import Slider from './Slider.svelte';

	let hue = 99;
</script>

<!-- html -->

<p style:hue style="--theme-color: hsl({hue}, 100%, 50%)">Hue: {hue}</p>
<Slider bind:hue />
<p style:hue style="--theme-color: hsl({hue}, 100%, 50%)">
	This colour is set by an external component
</p>

<style>
	p {
		color: var(--theme-color);
	}
</style>
```

## For more

-   [Jon Stodle's blog on CSS variables and svelte](https://blog.jonstodle.com/svelte-and-css-variables-is-a-match-made-in-heaven/)
-
