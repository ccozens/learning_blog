---
title: Deconstructing svelte society's timer
description: Deep dive into how a timer using tweened and setInterval works
date: 2023-08-16
tags:
    - learning
    - svelte
    - notes
    - tweened
---

<!-- vscode-markdown-toc -->

-   1. [Deconstructing svelte society's timer](#Deconstructingsveltesocietystimer)
    -   1.1. [What is it?](#Whatisit)
    -   1.2. [The code](#Thecode)
    -   1.3. [Dependencies](#Dependencies)
    -   1.4. [How it works](#Howitworks)

<!-- vscode-markdown-toc-config
	numbering=true
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->

## 1. <a name='Deconstructingsveltesocietystimer'></a>Deconstructing svelte society's timer

[The Svelte Society](https://sveltesociety.dev/) has [a demo repo with a countdown timer based on tweened and setInterval](https://svelte.dev/repl/42ed4a09041e4e39b2f43f798eb898cb?version=4.2.0), which is exactly what I have been looking at for a new app TODO add url here.

### 1.1. <a name='Whatisit'></a>What is it?

The part I am interested in is that it sets a timer based on a number of seconds, and then counts down to zero, displaying the count on screen formatted as minutes and seconds.

### 1.2. <a name='Thecode'></a>The code

```javascript
<script>
	import { tweened } from 'svelte/motion';
  let original = 5 * 60; // TYPE NUMBER OF SECONDS HERE
	let timer = tweened(original)

  // ------ dont need to modify code below
  import Typewriter from "svelte-typewriter";
  setInterval(() => {
    if ($timer > 0) $timer--;
  }, 1000);

  $: minutes = Math.floor($timer / 60);
  $: minname = minutes > 1 ? "mins" : "min";
  $: seconds = Math.floor($timer - minutes * 60)
</script>

<main>
  <div class="flex">

    <img src="https://sveltesociety.dev/images/logo.svg" alt="logo" width="100" />
    <div class="title">SVELTE SOCIETY DAY</div>
  </div>

  {#if timer < 1}
    <Typewriter loop>
      <h1>Starting soon....</h1>
    </Typewriter>
  {:else}
<h1>We will be back in <span class="mins">{minutes}</span>{minname}

	<span class="secs">{seconds}</span>s!</h1>
<progress value={$timer/original}></progress>
  {/if}
  <!-- 	feel free to modify this text!! -->
  <ul>
    <li>
      <strong>Next talk</strong>
      : Effective Transitioning (Andrew Smith)
    </li>
    <li>
      <strong>Then</strong>
      : A Framework for the Modern Storyteller (Robert Hall)
    </li>
    <li>
      <strong>Last</strong>
      : Svelte FAQ (Rich Harris)
    </li>
  </ul>

  <footer>
    <p>
      <em>
        See this REPL at
        <a
          href="https://svelte.dev/repl/42ed4a09041e4e39b2f43f798eb898cb?version=3.21.0"
        >
          https://bit.ly/2zxmJiu
        </a>
      </em>
    </p>
    <p>
      <em>
        All Talks and Demos/Resources at
        <a href="https://bit.ly/3bDwMAA">https://bit.ly/3bDwMAA</a>
      </em>
    </p>
  </footer>
</main>

<style>
  main {
    width: 600px;
    margin: 0 auto;
  }

	progress {
		display: block;
		width: 100%;
	}
	.mins {
		color: darkgoldenrod;
	}
	.secs {
		color: darkgoldenrod;
	}
  footer {
    margin-top: 3rem;
  }
  li {
    margin-bottom: 1rem;
  }
  .flex {
    display: flex;
    align-items: center;
  }
  .title {
    font-size: 2rem;
    font-weight: bold;
  }
</style>

```

### 1.3. <a name='Dependencies'></a>Dependencies

This code relies on the following functions and packages:

1. [tweened](https://svelte.dev/docs/svelte-motion#tweened): a svelte motion store that updates a value over fixed time
2. [setInterval](https://developer.mozilla.org/en-US/docs/Web/API/setInterval): a global method that repeatedly calls a function at a fixed time interval.
3. [progress indicator element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/progress): an indicator showing the completion progress of a task, typically displayed as a progress bar.
4. [svelte-typewriter](https://sr.ht/~henriquehbr/svelte-typewriter/): a svelte component that types out text as if it were being typed on a typewriter - not important for the function so I won't go into it here.

### 1.4. <a name='Howitworks'></a>How it works

1. The timer is set to a number of seconds, in this case 5 minutes, and is stored in a tweened store called `original`:

```javascript
import { tweened } from 'svelte/motion';
let original = 5 * 60; // TYPE NUMBER OF SECONDS HERE
let timer = tweened(original);
```

2. A callback in setInterval is called every second, and if the timer is greater than 0, the timer is decremented by 1:

```javascript
setInterval(() => {
	if ($timer > 0) $timer--;
}, 1000);
```

3. Three reactive variables are created to display the minutes and seconds on screen:

```javascript
$: minutes = Math.floor($timer / 60);
$: minname = minutes > 1 ? 'mins' : 'min';
$: seconds = Math.floor($timer - minutes * 60);
```

4. The minutes and seconds are displayed on screen, along with a progress bar:

```html
<h1>We will be back in <span class="mins">{minutes}</span>{minname}

  <span class="secs">{seconds}</span>s!</h1>
<progress value={$timer/original}></progress>
```

From there on its a fixed unordered list and styling so I won't go into it.
