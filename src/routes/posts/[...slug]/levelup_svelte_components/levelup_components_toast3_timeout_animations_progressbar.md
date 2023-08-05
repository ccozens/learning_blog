---
title: Using Tweened As a Timeout
date: '2023-08-03'
description: Intro to tweened
tags:
    - levelup
    - sveltekit
    - components
---

## [Using Tweened As a Timeout](https://levelup.video/tutorials/building-svelte-components/using-tweened-as-a-timeout)

[Tweened stores update their values over a fixed duration](https://svelte.dev/docs/svelte-motion#tweened). Tweening in [animation is a short for inbetweening](https://www.adobe.com/uk/creativecloud/video/discover/tweening.html) and it's the process of generating images that go between keyframes.

1. In `Toast.svelte`: `import { tweened } from 'svelte/motion';`
2. Some examples of what it can do:

```
<script>
let progress = tweened(0, { duration: 1000});
function updateProgress() {
    progress.set(Math.random() * 100);
}
</script>

<h1>{$progress}</h1>
<button on:click={() => progress.set(100)}>Set to 100</button>
<button on:click={updateProgress}>Update progress</button>
```

Here, progress interpolates between the two values, and `<h1>{$progress}</h1>` subscribes to it to show each time it changes. So, button _Set to 100_ zooms from 0 -> 100, and _Update progress_ button moves to a random number less than 100.

3. A surprise progress bar based on subscribing to the tweened value:

````
<div class="progress-bar">
	<div class="progress" style={```width: ${$progress}%; height: 10px; background:green;```} />
</div>
````

4. `Progress.set` returns a promise, meaning if we convert to an async function we can fire off an action when the promise resolves, for example `toast.remove`:

```javascript
async function updateProgress() {
	await progress.set(Math.random() * 100);
	toast.remove();
}
```

Now, the progress bar updates and the toast message is removed when it finishes.
