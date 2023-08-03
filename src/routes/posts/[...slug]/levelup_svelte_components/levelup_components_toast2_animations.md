---
title: Flip and Transition Animations with Toast Messages
date: '2023-08-03'
description: description
tags:
  - levelup
  - sveltekit
  - components
---
#[Flip and Transition Animations with Toast Messages](https://levelup.video/tutorials/building-svelte-components/flip-and-transition-animations-with-toast-messages)

--> remove a toast message, and animate.
Starting point is end of previous video.

##Add animations
1. Get animations up and running in ```Toast.svelte```:

```
import {fly, fade } from 'svelte/transition';
import { flip } from 'svelte/animate';
```

[flip = first, last, inverse, play](https://svelte.dev/docs/svelte-animate#flip): it calculates the start and end position of an element and animates between them, translating the x and y values. For mor info, [this is the blog post on FLIP linked from svelte docs](https://aerotwist.com/blog/flip-your-animations/).

2. Add in and out animations:

```
<div class="toast"
    in:fly={{ opacity: 0, x: 100}}
    out:fade
    animate:flip
>
```

Here:
- [fly animation](https://svelte.dev/docs/svelte-transition#fly) starts at opacity: 0 and automatically transitions to 1, and starts at x: 100 = offset x of 100 px.
- [fade animation](https://svelte.dev/docs/svelte-transition#fade) is using presets
- [animate:flip](https://svelte.dev/docs/svelte-animate#flip) will cause the whole stack to glide up in animated manner. Note this causes an error as ```flip``` needs a keyed list, so for now add a ```math.random()``` call.

In ```+page.svelte```: ```<button on:click={() => toast.send('add PB' +Math.random())}>Make Toast</button>```
And then in ```Toast.svelte``` add ```index(message)``` to use random message as key: ```{#each $toast as message, index(message)}```

##Remove messages
For now, we're just going to remove the first item of the array as PoP.

1. In ```toast.js```'s _newToast_, add _remove()_ below _send()_ and add it to the returned methods:

```javascript
const newToast = () => {
    const { subscribe, update } = writable([]);

    function send(message) {
        // create a new array containing all daa in state and add new message
        update((state) => [...state, message]);
    }

    function remove() {
        update((state) => {
            let [first, ...rest] = state;
            return [...rest];
        })
    }

    return {
        subscribe,
        send,
        remove,
    }
}
```

Note copilot suggested this simpler version:

```
function remove() {
   update((state) => {
       // remove the first message from the array
       state.shift();
       return state;
   });
}
```

2. Add a call to the button in ```Toast.svelte```:

```
<div class="toast"
    on:click={toast.remove}
    in:fly={{ opacity: 0, x: 100}}
    out:fade
    animate:flip
    >
```

3. Enjoy!
