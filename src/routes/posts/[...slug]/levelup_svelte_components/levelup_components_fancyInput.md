---
title: Fancy Input
date: '2023-08-03'
description: description
tags:
  - levelup
  - sveltekit
  - components
---
#[Fancy Input](https://levelup.video/tutorials/building-svelte-components/fancy-input)

Fancy inputs can be used for form fields in svelte: ```src/lib/Field.svelte```. The goal here is to create a component that does things you don't want to have to do each time.

1. Set up ```Field.svelte``` to have element properties as component props:

```
<!-- script -->
<script>
	export let label = '';
	export let instructions = '';
	export let style = '';
	export let placeholder = '';
	export let value; // no default as want it to be required, and don't want to assume types for TS
	export let type = 'text';
</script>

<!-- html -->

<div {style}>
	<label>
		{#if label}
			<span>{label}</span> <br />
		{/if}
		{#if instructions}
			<span class="instructions">{instructions}</span> <br />
		{/if}
		<input on:input={handleInput} {type} {value} {placeholder} />
	</label>
</div>
```

Here,
- wrapper div receives style
- the label is wrapped in an if clause, meaning there is no label shown as by default it is an empty string (which equates to _false_), and will render if a label is entered.
- ditto instructions, which also has its own style
- input type is set to the default value where _type="text"_, and can be amended if desired.


2. Use it! ```+page.svelte```:

```
<script>
    import Field from '$lib/Field.svelte';
</script

{search}
<Field bind:value={search} />
```

Note value set equal to search as already exists on page and saves setting up a new var.
You can type but nothing changes.

3. If choose to bind value in ```Field.svelte```: ```<input {type} bind:value {placeholder} />``` you get an error: _'type' attribute cannot be dynamic if input uses two-way binding_, which means if the _type_ attribute is coming in as a prop then svelte cannot properly bind the value.

Workaround: go back to ```<input {type} {value} {placeholder} />``` and write a handleInput fn:

```
	function handleInput(e) {
		// type comes from let type above
		value = type.match(/^(number|range)$/) // if the type is a range or a number
			? +e.target.value // add e.target.value
			: e.target.value; // otherwise, just use it
	}
```

and update input: ```<input on:input={handleInput} {type} {value} {placeholder} />```

aaand now input is binding and displays on screen as type

4. Use the props!
```	<Field
		bind:value={search}
		label="Search"
		instructions="Type in the box"
		placeholder="I'm a box"
       style="background-color: lightgoldenrodyellow;"
	/>```
