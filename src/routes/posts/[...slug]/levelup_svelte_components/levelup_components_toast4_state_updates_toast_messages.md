---
title: Complex State Updates With Toast Messages
date: '2023-08-03'
description: description
tags:
  - levelup
  - sveltekit
  - components
---
#[Complex State Updates With Toast Messages](https://levelup.video/tutorials/building-svelte-components/using-tweened-as-a-timeout)

1. Create ```src/lib/toast/ToastMessage.svelte``` and scaffold:

```
<!-- script -->
<script>
	export let message = '';
</script>

<!-- html -->

<p>
	{message}
</p>
```

2. Update ```Toast.svelte```:

```
<script>
	//...
	import ToastMessage from './ToastMessage.svelte';
	//...
</script>

<Portal>
	<div class="toast-wrapper">
		{#each $toast as message, index (message)}
			<div
				class="toast"
				on:click={toast.remove}
				in:fly={{ opacity: 0, x: 100 }}
				out:fade
				animate:flip
			>
			<!--update here-->
				<ToastMessage {message} />
			</div>
		{/each}
	</div>
</Portal>
```

This now works the same and is more composable.

3. We can use [onMount](https://svelte.dev/docs/svelte#onmount) to run a tweening function whenever a toast message loads. In ```ToastMessage.svelte```:

```
<!-- script -->
<script>
	import { tweened } from 'svelte/motion';
    import { toast } from './toast';
	import { onMount } from 'svelte';
	export let message = '';

    // tweened starts at 100% and goes to 0% over 1 second
	let progress = tweened(100, { duration: 1000 });

	onMount(async () => {
		// when the component mounts, start the progress bar
		await progress.set(0);
		// when the progress bar is done, remove the toast
		toast.remove();
	});
});
</script>

<!-- html -->

<div class="progress-bar">
	<div class="progress" style={```width: ${$progress}%; height: 10px; background:green;```} />
</div>
<p>
	{message}
</p>

<style>
	p {
		margin: 0;
	}
</style>
```

Now, when a message loads it has a progress bar that tracks from full to nothing and the message is removed at zero. Copilot suggests a JS variant that didn't use the toast method:

```javascript
progress.subscribe((value) => {
        if (value === 0) {
            toast.remove();
        }
    });
```

4. However, multiple toasts all run on the same timer, so pass a duration prop into Toast on ```+page.svelte```: ```<Toast duration={3000}/>```, then ```Toast.svelte``` gets ```export let duration = 1000;``` and ```<ToastMessage {message} {duration} />```. Finally, ```ToastMessage.svelte``` also gets ```export let duration = 1000;``` and amend *progress* to ```let progress = tweened(100, { duration });``` to use passed on value. Aaaaand now they all run on their own timer.
