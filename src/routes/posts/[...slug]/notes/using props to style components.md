---
title: Using props to style components
date: '2023-07-31'
description: Intro to styling components with props
tags:
  - sveltekit
  - notes
---
#Using props to style components
In `+page.svelte`

```
<script>
   import Component from '$lib/Component.svelte';
</script>

<Component />
```

And in `Component.svelte`

```
<div class="square" {style}/>

<style>
	.square {
		background-color: var(--squareBackgroundColour, gold);
        height: var(--squareSize, 50px);
        width: var(--squareSize, 50px);
	}
</style>
```

This creates a gold square, 50 x 50 px.

Note the colours are set using [CSS variables with default values](https://developer.mozilla.org/en-US/docs/Web/CSS/var), meaning that `background-color: var(--squareBackgroundColour, gold);` will set the background colour to gold _unless --squareBackgroundColour is defined_.

So, update `Component.svelte` to create a component prop:

```
<script>
    export let style = "";
</script>

```

And pass it into the div:

```
<script>
    export let style = "";
</script>

<div class="square" {style}/>
```

Then in `+page.svelte`, simply declare a _Component_ with styles passed in:

`<Component style="--squareBackgroundColour: green; --squareSize: 75px;"/>`

##Adding reactivity

1. Define `src/lib/functions/ColourPicker.js`

```javascript
export function colourPicker() {
    /// random colour generator
    let colour = '#';
    for (let i = 0; i < 6; i++) {
        colour += Math.floor(Math.random() * 16).toString(16);
    }
    return colour;
}
```

(thanks copilot)

2. Update `Component.svelte`:

```
<script>
    import { colourPicker } from "./functions/ColourPicker";
    export let style = "";

    function updateStyle() {
        // extract the current value of squareSize
        const currentSize = style.match(/--squareSize:\s*([^;]+)/);
        // if currentSize is set, leave it, otherwise set to 50px
        const newSize = currentSize ? currentSize[1] : "50px";
        style = `--squareSize: ${newSize}; --squareBackgroundColour: ${colourPicker()};`;
    }

</script>

<button class="square" {style} on:click={updateStyle}/>

<style>
    .square {
        background-color: var(--squareBackgroundColour, gold);
        height: var(--squareSize, 50px);
        width: var(--squareSize, 50px);
    }
</style>
```

Specifically:
- changed `<div>` to `<button>` for accessability when adding click event
- added on:click to run updateStyle function
- added function _updateStyle_ which, when run:
	(1) Extracts current value of _--squareSize_ by matching anything after _--squareSize:_ and before _;_ and setting as _currentSize_.
	(2) If no size was passed in and the square is the default size (50px, as set by fallback in CSS variable), _currentSize_ is null. If a size was passed in, _currentSize_ has a value. So, if _currentSize_ has a value then _newSize_ is set to _currentSize_, otherwise _newSize_ is set to 50px (the fallback size).
	(3)   _style_ is set to define _--squareSize_ as _newSize_, and _--backgroundColour_ as the output of _colourPicker()_.
-
