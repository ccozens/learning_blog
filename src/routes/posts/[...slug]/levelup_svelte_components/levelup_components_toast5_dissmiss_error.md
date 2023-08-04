---
title: Dismiss-able Toasts and Error Toasts
date: '2023-08-03'
description: Dissmiss-able Toasts messages - click to dismiss
tags:
  - levelup
  - sveltekit
  - components
---
#[Dismiss-able Toasts and Error Toasts](https://levelup.video/tutorials/building-svelte-components/dismiss-able-toasts-and-error-toasts)

--> making toast messages more configurable

##Toast messages

1. In ```toast.js```, update _send_ function to take in an objectL

```javascript
function send(message, { duration = 2000, type = "INFO"}) {
    // create a new message object
    const id = new Date().getTime(); // unique id

    const newMessage = {
        id,
        duration,
        type,
        message
    }
    // create a new array containing all daa in state and add new message
    update((state) => [...state, newMessage]);
}
```

2. As a result of adding duration here, need a few updates to ```ToastMessage.svelte```:

```
<script>
	export let message = {message: '', duration: 1000};

	let progress = tweened(100, { duration: message.duration });
</script>

<p>
	{message.message} // was previously: {message}
</p>
```
and remove ```export let duration```


3. and ```Toast.svelte```:

- remove ```export let duration ;``` as don't need prop any more, and also remove from ```<ToastMessage {message} />``` instantiation.

4. Error!

```error
toast.js?t=1689759612185:7 Uncaught TypeError: Cannot read properties of undefined (reading 'duration')
    at Object.send (toast.js?t=1689759612185:7:30)
    at HTMLButtonElement.click_handler (+page.svelte:41:32)
```

Which means when click ```<button on:click={() => toast.send('add PB')}>Make Toast</button>``` in ```+page.svelte```, there is no data for _duration_ passed to _send_, causing the object destructuring to fail. So, can add a default of empty object ```= {}``` to _send_, like so: ```function send(message, { duration = 2000, type = "INFO" } = {} )```, so that JS knows what to expect.

Now all works!

5. Make multiple toasts in ```Toast.svelte``` so can experiment with properties:

```
<button on:click={() => toast.send('add PB')}>Make Toast</button>
<button on:click={() => toast.send('add jam', { duration: 3000})}>Make Toast in 3 seconds</button>
<button on:click={() => toast.send('add fish', { duration: 3000, type: 'ERROR'})}>Make Toast Error</button>
<Toast />
```

6. Jazz up a little in ```Toast.svelte```:

```
<style>
.toast {
	...
	background-color: var(--toast-background, #625df5);
	}
</style>
```

7. Change toast style based on type of message, for example via CSS properties or, here, classes:

```
<style>
.toast.error {
	background-color: var(--toast-error-background, #e54b4b);
	color: black;
}
</style>
```

Note if SCSS/PostCSS was set up, could have use ```&```:

```
<style>
.toast {
---
	background-color: var(--toast-background, #625df5);
	&.error {
		background-color: var(--toast-error-background, #e54b4b);
		color: black;
	}
}
</style>
```

Then to apply, update class on ```class="toast"``` to ``````class={```toast ${message.type.toLowerCase()}```}``````.


##Progress bar styling
1. Currently its green ``````<div class="progress" style={```width: ${$progress}%; height: 10px; background:green;```} />``````
2. Keep the width and otherwise break out into style tag and style properly:

```
<div class="progress" style={```width: ${$progress}%;```} />

<style>
.progress {
	height: 6px;
	background: whitesmoke;
	opacity: 0.3;
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
}
</style>
```

Need to update ```.toast``` style in ```Toast.svelte``` to include ```position: relative;``` as ```position:absolute``` [sets position relative to its nearest positioned ancestir (ie, the nearest parent that is not static)](https://developer.mozilla.org/en-US/docs/Web/CSS/position).

##Dismissing on click

Currently ```toast.js``` removes the first item in the array when called:

```javascript
function remove() {
    update((state) => {
        let [first, ...rest] = state;
        return [...rest];
    })
}
```

We now have an id param, so update to accept the _id_, and filter the items:

```
function remove(id) {
    update((store) => {
        let newStore = store.filter((item) => item.id !== id); // if item.id is not equal to id, return it
        return [...newStore];
    })
}
```

Then, update the toast in ```Toast.svelte``` to pass the message ID when called:

```
<div
	class={```toast ${message.type.toLowerCase()}```}
	on:click={toast.remove(message.id)}
	in:fly={{ opacity: 0, x: 100 }}
	out:fade
	animate:flip
>
```

Also amend ```ToastMessage.svelte``` to pass message id into the _toast.remove_ call:

```javascript
onMount(async () => {
	// when the component mounts, start the progress bar
	await progress.set(0);
	// when the progress bar is done, remove the toast
	toast.remove(message.id);
});
```
