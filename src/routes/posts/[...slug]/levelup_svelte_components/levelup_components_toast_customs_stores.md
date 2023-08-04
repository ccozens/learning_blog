---
title: Advanced Custom Stores With a Toast Message
date: '2023-08-03'
description: Custom stores with a toast message
tags:
  - levelup
  - sveltekit
  - components
---
## [Advanced Custom Stores With a Toast Message](https://levelup.video/tutorials/building-svelte-components/advanced-custom-stores-with-a-toast-message)

[Toast messages](https://www.magicbell.com/blog/what-is-a-toast-message-and-how-do-you-use-it) help to deliver simple feedback to the user. They are informative, have a lifespan of just a few seconds and take up a very small portion of the screen.

--> create a toast message

1. Create a new folder! ```src/lib/toast```, Containing ```toast.js``` and ```Toast.svelte```.
2. Create a basic store in ```toast.js```:

```javascript
import { writable } from 'svelte/store';

// function to create store
const newToast = () => {
    const { subscribe, update } = writable([]);

    return {
        subscribe,

    }
}

export const toast = newToast();
```

3. Create custom state in newToast:

```javascript
const newToast = () => {
    const { subscribe, update } = writable([]);

    function send(message) {
        // create a new array containing all daa in state and add new message
        update((state) => [...state, message]);
    }

    return {
        subscribe,
        send,
    }
}
```

4. In ```Toast.svelte```:

```
<!-- script -->
<script>
    import Portal from '$lib/Portal.svelte';
    import { toast } from './toast';

</script>

<!-- html -->

<Portal>
	<div class="toast-wrapper">
		{#each $toast as message}
			<div class="toast">
				<p>
					{message}
				</p>
			</div>
		{/each}
	</div>
</Portal>

<style>
	.toast-wrapper {
		position: fixed;
		bottom: 0;
		right: 20px;
		z-index: 1000;
	}

	.toast {
		background-color: #333;
		color: #fff;
		padding: 10px;
		margin: 10px;
		border-radius: 5px;
		box-shadow: 1px 1px 4px (rgba(0, 0, 0, 0.3));
	}

	p {
		margin: 0;
	}
</style>
```

Note:
- ```{#each $toast as message}``` only works as a reactive statement because the ```subscribe``` function is returned from ```newToast```


5. Finally, in ```+page.svelte```:

```
<script>
	// import component to display
	import Toast from '$lib/toast/Toast.svelte';
	// import toast store to give access to methods
	import { toast } from '$lib/toast/toast';
	// ...
</script>

<!--button to display it-->
<button on:click={() => toast.send('add PB')}>Make Toast</button>

<!--component-->
<Toast />
```

It works! Messages don't dissappear but it does work.

Essentially, we have a button that runs a *send* function accepting a string. The *send* function adds the new string to an array, and its parent function *newToast* returns the *subscribe* method. That means in ```Toast.svelte``` we can subscribe to the store (```{#each $toast as message}```) and the *each* loop is rerun when *toast* updates.
