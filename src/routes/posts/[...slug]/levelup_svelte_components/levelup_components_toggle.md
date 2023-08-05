---
title: Basic toggle
date: '2023-08-03'
description: DIY toggle
tags:
    - levelup
    - sveltekit
    - components
---

#[Basic toggle](https://levelup.video/tutorials/building-svelte-components/creating-a-toggle)

##A barebones toggle

1. Create `src/lib/Toggle.svelte`
2. Code:

```
<label>
    <input type="checkbox" />
</label>
```

Wrpapping the toggle in a label becomes significant later, as means you can click the toggle itself.

3. In homepage, render checkbox:

```
<script>
    import Toggle from "$lib/Toggle.svelte";
</script>

<h1>Welcome to Level UI</h1>

<Toggle />
```

...and now we have an unstyled checkbox

4. In `Toggle.svelte`, add an empty div with class toggle, and style checkbox:

```
<label>
	<input type="checkbox" />
	<div class="toggle"></div>
	Label
</label>

<style>
	label {
		--width: 40px;
		--height: calc(var(--width) / 2);
		--radius: calc(var(--height) / 2);
	}

	.toggle {
		position: relative;
		width: var(--width);
		height: var(--height);
		border-radius: var(--radius);
		border: solid 1px #333;
		transition: background-color 0.2s ease-in-out;
	}

	.toggle::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: var(--height);
		height: var(--height);
		border-radius: var(--radius);
		background-color: aliceblue;
		box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.3);
		transition: transform 0.2s ease-in-out;
	}

	input:checked + .toggle::after {
		/* transform: translateX(calc(var(--width) - var(--height))); */
		transform: translate3d(100%, 0, 0);
	}

	input:checked + .toggle {
		background-color: cyan;
	}

	input {
		display: none;
	}
</style>
```

`label` section creates scoped CSS variables: - width is defined. - height is width /2. - radius is height /2.
`.toggle` styles the empty div into a pillbox shape.
[`.toggle::after`](https://developer.mozilla.org/en-US/docs/Web/CSS/::after) creates a pseudoelement that represents a styleable child pseudo-element immediately after the originating element's actual content. This creates the dot that toggles back and forth.
`.input:checked + .toggle::after`: this checks whether the input is checked, and if so animates the toggle::after selector. The commented out code was copilot's suggestion, that seems to work the same.

-   `.input:checked + .toggle`: colours the pillbox background when toggle toggled.
-   `input { display: none;}` hides the original checkbox
