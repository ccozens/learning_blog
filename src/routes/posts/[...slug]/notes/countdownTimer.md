---
title: Countdown timer
description: A countdown component from frontend masters.
date: 2023-08-14
tags:
    - timer
    - svelte
    - countdown
    - tweened
    - notes
---

[Rich Harris frontend masters countdown timer video](https://frontendmasters.com/courses/svelte-v2/countdown-timer/)

## Reactivity

[Recap of svelte tutorial](https://learn.svelte.dev/tutorial/reactive-assignments)

### Assignments

`on:click={increment}` assigns the function to the click event, and the svelte compiler then knows it needs to re-render the component when the event is fired.

```javascript
<script>
let count = 0;

function increment() {
    count += 1;
}
</script>

<button on:click={increment}>
    Clicked {count}
    {count === 1 ? 'time' : 'times'}
</button>
```

### Reactive declarations

`$: doubled = count * 2;` is a reactive value. It will re-run the code whenever the variables it depends on change.

```javascript
<script>
let count = 0;
$: doubled = count * 2;
function increment() {
    count += 1;
}
</script>

<button on:click={increment}>
    Clicked {count}
    {count === 1 ? 'time' : 'times'}
</button>
{count} doubled is {doubled}
```

Svelte team co-opted JavaScript _$_, a syntactical construct called a label, which is something you use during for / while loops that allow you to break out to a specific part of the code. Here, it's used to denote a reactive declaration.

### Reactive statements

_$_ syntax also allows for reactive statements, which are re-run whenever the variables they depend on change.

`` $: console.log(`the count is ${count}`) ``

## Motion Stores

Don't forget these are stores!

[Recap of svelte tutorial](https://learn.svelte.dev/tutorial/motion/tweens)

<details>
<summary>
Initial code
</summary>

```javascript
<script>
    import { writable } from 'svelte/store';
    const progress = writable(0);
</script>


<progress value={$progress} />

<button on:click={() => progress.set(0)}>
 0%</button>

<button on:click={() => progress.set(0.25)}>
 25%</button>

<button on:click={() => progress.set(0.5)}>
 50%</button>

<button on:click={() => progress.set(0.75)}>
 75%</button>

<button on:click={() => progress.set(1)}>
 100%</button>
<style>
    progress {
        display: block;
        width: 100%;
    }
</style>
```

</details>

The inital progress bar jumps from value to value. We can use tweening to make it animate smoothly.

Motion stores the current value of the tween in a variable called `x`. It's a number that goes from 0 to 1, and it represents the progress of the tween.

```javascript
<script>
     import { tweened } from 'svelte/motion';
    const progress = tweened(0);
</script>

<!-- No changes to markup-->
```

Progress bar is not smoother, but still robotic.

### Easing

An easing function takes a value between 0 and 1 and returns a value between 0 and 1. The default easing function is linear, which is why the progress bar is still robotic.
Svelte has a [library of easing functions](https://svelte.dev/docs/svelte-easing), and an [ease visualiser example](https://svelte.dev/examples/easing).

To apply, import and pass the easing function to the tweened store.

```javascript
<script>
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';

    const progress = tweened(0, {
        duration: 500,
        easing: cubicOut
    });
</script>
<!-- No changes to markup-->
```

Can also pass duration in milliseconds, and a custom interpolation function, for example to interpolate between colours.

### Springs

[The spring function](https://learn.svelte.dev/tutorial/springs) is an alternative to tweened that often works better for values that are frequently changing.
