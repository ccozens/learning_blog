---
title: Click Outside Action
date: '2023-08-03'
description: Adding a click outside action to close modal
tags:
  - levelup
  - sveltekit
  - components
  - actions
---
#[Click Outside Action](https://levelup.video/tutorials/building-svelte-components/click-outside-action)

back to the modal!
--> use a [svelte action](https://svelte.dev/docs/svelte-action) to close modal when click outside

1. Add background prop to ```Modal.svelte``` and display background based on prop:

```
<script>
	//...
	export let background = true;
	//...
</script>

{#if isModalOpen}
	<Portal>
        <div class="modal-wrapper" transition:fly={{ opacity: 0, y: 100 }}>
            <slot />
            <button on:click={closeModal} aria-label="Close Modal Box">Close</button>
		</div>
		<!--added if clause-->
        {#if background}
		    <div on:click={closeModal} transition:fade class="background" />
        {/if}
        </Portal>
{/if}
```

2. Modify ```+page.svelte``` to pass in _false_ to check: ```<Modal bind:isModalOpen background={false}>``` it works

3. Create ```src/lib/functions/ClickOutside.js```:

```javascript
export function clickOutside(node) {
    function handleClick(event) {
        // fire event if: event has not been prevented default, if the node does not contain the event target, and the node exists
        if(node && !node.contains(event.target) && !(event.defaultPrevented)) {
        // could fire a function or custom node event
        node.dispatchEvent(
            // CustomEvent allows us to create an event with whatever name we want
            new CustomEvent('click-outside')
        )
    }
    }

    // add event listener to the document. Listen for click, if it happens fire handleClick
    document.addEventListener('click', handleClick, true)

    return {
        destroy() {
        // remove event listener when component is destroyed
        document.removeEventListener('click', handleClick, true)
        }
    }
}
```

Here we export the function _clickOutside_, which contains:
- a _handleClick_ function that [dispatches a custom event](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent) _click-outside_ when the [default user action has not been prevented](https://developer.mozilla.org/en-US/docs/Web/API/Event/defaultPrevented), the node does not contain the event target (ie, wasn't the clicked-on element) and the node exists.
- adds [an event listener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) to the node which listens for a [click event](https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event), fires _handleClick_ when it detects one, and _true_, which adds the event during the capturing phase of DOM event propogation.  This allows triggering of event listeners on parent elements before event listeners on child elements.
- returns the [Svelte action](https://svelte.dev/docs/svelte-action)'s destroy method that runs when the element is unmounted, which [removes the event listener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener).


4. Import into ```Modal.svelte```: ```import { clickOutside } from '$lib/functions/ClickOutside';``` and attach to modal:

```
<div
	use:clickOutside
	on:click-outside={closeModal}
	class="modal-wrapper"
	transition:fly={{ opacity: 0, y: 100 }}
>
```
Here,
- the [use:_action_ directive](https://svelte.dev/docs/element-directives#use-action) tells the button to use the action _click-outside_
- the [on:_eventname_ directive](https://svelte.dev/docs/element-directives#on-eventname) tells the button what to do when the _click-outside_ action is run

5. Add some nicer styling to close button in ```Modal.svelte```:

```
.close-btn {
	position: absolute;
	top: 0;
	right: 0;
	padding: 0.5rem;
	border: none;
	background-color: transparent;
	cursor: pointer;
	box-shadow: -3px 3px 3px rgba(0, 0, 0, 0.20);
	border-radius: 0.5rem;
}
```

This action can be used to close a menu if click away.
