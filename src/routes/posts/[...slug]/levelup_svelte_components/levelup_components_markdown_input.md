---
title: Markdown input
date: '2023-08-03'
description: Making a markdown input component, and rendering with marked
tags:
    - levelup
    - sveltekit
    - components
    - markdown
---

#[Markdown input](https://levelup.video/tutorials/building-svelte-components/markdown-input)

1. Create `src/lib/Markdown.svelte`
2. Set up basic text area:

```
<!-- script -->
<script>
	let text = '';
	$: console.log(text);
</script>

<!-- html -->

<div>
	<textarea
		cols="30"
		rows="10"
		bind:value={text}
		/>
</div>
```

-   `cols` and `rows` set the [textarea](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea) size
-   `bind:value={text}` binds the variable _text_ to the value of text input

3. Add [marked to allow markdown parsing](https://marked.js.org/): `pnpm add marked`
4. import and use in `Markdown.svelte`!

```
<!-- script -->
<script>
    import {marked} from 'marked';
	let text = '';
    let markdownText = text;

	// reactive expression
    $: {
        markdownText = marked(text)
    }
	$: console.log(markdownText);
</script>

<!-- html -->

<div>
	<textarea name="" id="" cols="30" rows="10" bind:value={text} />
    <div>
        {markdownText}
    </div>
</div>
```

This outputs the raw html.

5. [Svelte has a special tag @html](https://svelte.dev/docs/special-tags#html) to render html:

`{@html markdownText}`

Output is now rendered!

6. Styling.

```
...
<div class="markdownContainer">
...

<style>
    .markdownContainer {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .markdownContainer > * {
        width: 50%;
    }
</style>
```

Now renders with box centred and all children 50% width.

7. To make the data availabe in `+page.svelte`

-   first in `Markdown.svelte` make the variable a prop: `export let text = '';`
-   second in `+page.svelte`:

```
<script>
	...
	let text = '';
	$: console.log(text);
	...
</script>

    <h2>Markdown input</h2>
    <Markdown bind:text />

```
