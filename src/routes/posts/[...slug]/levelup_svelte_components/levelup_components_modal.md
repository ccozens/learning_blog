---
title: Making a modal
date: '2023-08-03'
description: What is a modal and how to make one
tags:
  - levelup
  - sveltekit
  - components
---
#[Making a modal](https://levelup.video/tutorials/building-svelte-components/making-a-modal)

A modal is a dialog box that appears on top of the app's content, and must be dismissed by the app before interaction can resume. It is often used to prompt the user for input or to ask for permission.

Note this uses previously made components! eg portal

1. Create ```src/lib/Modal.svelte```
2. Scaffold:

```
<script>
	import { fly, fade } from 'svelte/transition';
	import Portal from './Portal.svelte';

	// control whether modal open when a component loads
	export let isModalOpen = false;

	// function to close modal
	function closeModal() {
		isModalOpen = false;
	}
</script>

{#if isModalOpen}
	<Portal>
		<div class="modal-wrapper" transition:fly={{ opacity: 0, y: 100 }}>
			<button
			on:click={closeModal}
			aria-label="Close Modal Box"
			>Close</button>
			<slot />
		</div>
		<div on:click={closeModal} transition:fade class="background" />
	</Portal>
{/if}
```


So:
- transitions and Portal imported
- Boolean prop _isModalOpen_ and function to set it false to close modal set up
- simple _if_ clause to show modal
- modal itself has a [svelte fly transition](https://svelte.dev/docs/svelte-transition#fly), with intial opacity of 0 and y (ie distance from top of screen) 100.
- modal contains:
	- a button to close modal
	- slot for content
	- empty div with class _background_ for styling, which also has onclick property so clicking anywhere on modal will close it.

3. Use it in ```+page.svelte```:

```
<script>
	import Modal from '$lib/Modal.svelte';
</script>

<Modal>
	<h2>Modal</h2>
	<h3>Search term: {search}</h3>
	<SearchList {items} bind:search />
</Modal>
```
Nothing shows! Because ```isModalOpen = false```.

4. Add a button outside the modal:

```
<script>
	...
	let isModalOpen = false;
	...
</script>

<Modal {isModalOpen}>
	<h2>Modal</h2>
	<h3>Search term: {search}</h3>
	<SearchList {items} bind:search />
</Modal>
<button on:click={() => isModalOpen = true}>Open Modal</button>
```

5. This opens the modal but does not close it, as _Modal.svelte_'s closeModal function does not update _isModalOpen_ in ```+page.svelte```, because of variable scoping. So:

In +page.svelte:

```
<script>
  // ... (existing code)

  // Function to close the modal in page.svelte
  function closeModal() {
    isModalOpen = false;
  }
</script>

<!-- ... (existing code) -->

<Modal {isModalOpen} {closeModal}>
  <!-- ... (existing code in the modal) -->
</Modal>
```

In ```Modal.svelte```:

```
<script>
  // ... (existing code)

  // Control whether modal open when a component loads
  export let isModalOpen = false;

  // Function to close the modal
  export let closeModal;
</script>

{#if isModalOpen}
  <Portal>
    <div class="modal-wrapper" transition:fly={{ opacity: 0, y: 100 }}>
      <button on:click={closeModal} aria-label="Close Modal Box">Close</button>
      <slot />
    </div>
    <div on:click={closeModal} transition:fade class="background" />
  </Portal>
{/if}
```

And now it works!

***Easier***: don't do any of that and instead ```<Modal bind:isModalOpen>```, as [bind](https://svelte.dev/docs/element-directives#bind-property) specifically exists to allow data flow from child to parent.

6. Styling ```Modal.svelte```:


```

```

Note use of [CSS ```inset```](https://developer.mozilla.org/en-US/docs/Web/CSS/inset), which is shorthand that corresponds to the top, right, bottom, and/or left properties. It has the same multi-value syntax of the margin shorthand.

7. Styling 2: copilot's suggestion:

```css
<style>
    .modal-wrapper {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        padding: 2rem;
        border-radius: 0.5rem;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
        z-index: 1000;
    }
    .background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        backdrop-filter: blur(10px);
        z-index: 999;
    }
</style>
```

####inset positioning

I rather like the use of inset, for example this looks the same as copilot's suggestion:

```
.background {
    position: fixed;
    inset: 0;
    backdrop-filter: blur(10px);
    z-index: 999;
    cursor: pointer;
}
```

Both position an element to cover the entire viewport, however:
- ```inset: 0``` is concise and automatically adjusts to changes in the viewport size or scroll position. However, it may not be supported in older browers.
- ```top: 0; left: 0; width: 100vw; height: 100vh;``` is more flexible approach in that works well with all position values (fixed, absolute, relative, static) and can be used to create more complex layouts layouts with multiple elements positioned relative to the viewport. However, it is more verbose and may need  to be updated manually if the viewport size or scroll position changes.


#### The box shadow:
- 0 for the horizontal offset (no offset)
- 0 for the vertical offset (no offset)
- 10px for the blur radius (how spread out the shadow is)
- rgba(0, 0, 0, 0.25) for the color and opacity of the shadow (black with 25% opacity)
