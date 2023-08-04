---
title: Better Accordion
date: '2023-08-03'
description:    Making a better accordion component
tags:
  - levelup
  - sveltekit
  - components
---
## [Tutorial video](https://levelup.video/tutorials/building-svelte-components/accordion-without-unmounting-with-actions-part-1)

This accordion does not have the mounting and unmounting issues, meaning the slot content stays in the DOM. The biggest challenge is animating the ```height-auto```, which ```transition: slide``` did in the other version. Typically one would use CSS (which doesn't animate ```height-auto```) , so: JS!

Specifically this will use the [web animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) and a [svelte action](https://svelte.dev/docs/svelte-action), which give access to a DOM element in a resuable function.

## Create accordion using CSS
1. Create ```src/lib/BetterAccordion.svelte``` and copy Accordion in.
2. Add import and call to ```+page.svelte```:

```
<script>
	import BetterAccordion from '$lib/BetterAccordion.svelte';
	let isToggled=false;
</script

<BetterAccordion isOpen={false} buttonText="Better Accordion">
```

3. Remove svelte transitions and if statement from ```BetterAccordion.svelte```:

```
<script>
	export let buttonText = '';
	export let isOpen = true;
</script>

<div>
	<button on:click={() => (isOpen = !isOpen)}>
		{buttonText}
	</button>
		<div>
			<slot />
		</div>
</div>
```

4. Create new file to store reusable action function: ```src/lib/slide.js':

```javascript
export function slide(node, isOpen) {
    console.log(node, isOpen);
}
```

Log to console for now so can see what's going on.

5. In ```BetterAccordion.svelte```, import _slide_: ```import { slide } from './slide';``` and [use the action](https://svelte.dev/docs/element-directives#use-action):

```
<div>
	<button on:click={() => (isOpen = !isOpen)}>
		{buttonText}
	</button>
		<div use:slide>
			<slot />
		</div>
</div>
```

Note that ```node``` doesn't need passing in when using ```use```, so we only pass in ```isOpen```.

console logs HTML contents of slot:

```
<div>
	<div class="s-y_bCXRrkrYfP">
		<p class="s-y_bCXRrkrYfP" data-svelte-h="svelte-1oxvrl9">yeah</p>
		<p class="s-y_bCXRrkrYfP" data-svelte-h="svelte-xnb9lz">whoop</p>
	</div>
</div>
```

and _false_ for ```{isOpen}```.

6. Update ```slide.js```:

```javascript
export function slide(node, isOpen) {
    // catalog initial height of the item. OffsetHeight is a DOM property that gives us the node height (a number, not in px)
    let initialHeight = node.offsetHeight;
    // catalog whether Accordion is initially open or not. Set initially open by modifying the style property on the DOM node:
    node.style.height = isOpen ? 'auto' : 0; // auto if open, zero if closed
    // hide overflow as don't want any scrolling
    node.style.overflow = "hidden";
}
```


Nothing happens yet, but looking at the source we see the Accordion slot contents are visible in SSR HTML, and the accordion's CSS in devTools has been set: ```<div style="height: auto; overflow: hidden;">```

7. Add some function to ```slide.js``` using update:

```javascript
export function slide(node, isOpen) {
    // catalog initial height of the item. OffsetHeight is a DOM property that gives us the node height (a number, not in px)
    let initialHeight = node.offsetHeight;
    // catalog whether Accodrion is initially open or not. Set initially open by modifying the style property on the DOM node:
    node.style.height = isOpen ? 'auto' : 0; // auto if open, zero if closed
    // hide overflow as don't want any scrolling
    node.style.overflow = "hidden";

    return {
        // update runs and returns a value whenver a property is udpated
        update: (isOpen) => {
            console.log(isOpen);
        }
    }
}
```

Now isOpen is logged on click.

8. Add a line to return to set the accordion height and it opens and closes on click:

```javascript
  return {
        // update runs and returns a value whenver a property is udpated
        update: (isOpen) => {
            node.style.height = isOpen ? 'auto' : 0;
        }
    }
```

### Styling

Start in ```BetterAccordion.svelte```:

1. Add a ```span``` to button:

```
<button on:click={() => (isOpen = !isOpen)}>
	<span class:isOpen> &#9650; </span>
	{buttonText}
</button>
```

- ```&#9650;``` is an HTML entity [a black triangle character](https://symbl.cc/en/25B2/).
- ```class:isOpen``` = cool svelte thing. If isOpen is true, class isOpen is added to span.

2. CSS!

```
<style>
	button {
		display: block;
		border: 0;
		width: 100%;
		text-align: left;
		border: solid 1px #333;
		margin: 0;
	}

	span {
		margin-right: 5px;
		display: inline-block;
		transform: rotate(0.25turn);
		transition: transform 0.3s ease;
	}

	.isOpen {
		transform: rotate(0.5turn);
	}

	.accordion-content {
		padding-left: 8px;
		border: solid 1px #333;
		border-top: 0;
	}
</style>
```

Things to note:
- CSS scoped to this component, so can use ```button``` and ```span``` freely without worrying about selector crossover.
- ```span``` rotation is in turns. [transform: rotate()](https://developer.mozilla.org/en-US/docs/Web/CSS/rotate) can be degrees, turns or rads, as well as x, y, or z axes.
-  '.accordion-content' has no top border so that it does not create double border with the main accordion.

## [Animate it](https://levelup.video/tutorials/building-svelte-components/animating-our-accordion-with-the-web-animations-api)!

There are a lot of hacks using ```max-height```, but this is going to use the [web animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API).

1. Add to script tag of ```slide.js```:

```javascript
 let animation = node.animate([
		{
			height: 0,
		}, {
			height: ```${initialHeight}px```
		}
    ],
        {
            duration: 500, // 500 ms
            fill: 'both', // whichever direction the animation is run, it will remain in its final state when finished
            direction: isOpen ? 'reverse' : 'normal', // animation plays in reverse (open to height 0) if open, or forward (0 to open) when closed.
        }
	)
    animation.pause();
```

node.animate takes 2 properties.
- First an array of animation states. Here, initial height 0 and animated state the height is the measured node height interpolated to pixels.
- Second is animation properties, here duration of 500ms, fill and direction.

Note ```animation.pause()``` is essential otherwise the animation just runs. This stops it running and means we have to actively call it.

2. To run the animation when isOpen is updated, update the action's return to:

```
return {
     update: () => {
        animation.currentTime ? animation.reverse() : animation.play();
       }
}
```

- ```animation.currentTime``` gets the time of the animation. This is 0 if it has not run, so tells us whether it has run or not. So, if currentTime = 500, it runs in reverse, and if currentTime = 0, animation runs forwards.

3. This runs once, but goes kinda crazy. We need to add a function to tell the animation what to do when it is finished:

```javascript
 animation.onfinish = ({ currentTime}) => {
        if (!currentTime) {
            animation.reverse();
            animation.pause();
        }
     }
```

This stops the animation running endlessly and allows it to be interruped (that is, closes if click while mid-open):
- getting the current time
- if current time is not 0, it runs in reverse and then stops.

4. Add an event that fires when the animation is complete:

```javascript
 animation.onfinish = ({ currentTime }) => {
        // if animation in progress, reverse it and then stop
        if (!currentTime) {
            animation.reverse();
            animation.pause();
        }
        // if animation finishes, dispatch a cusotm event called animationEnd
        node.dispatchEvent(new CustomEvent('animationEnd'))
    }
```

5. In ```BetterAccordion.svelte```, add custom event and give it something to do:

```
<div
	class="accordion-content"
	use:slide={isOpen}
	on:animationEnd={() => console.log('animation ended')}
>
```

6. We can change the settings by passing more data into the function call in ```BetterAccordion.svelte```, eg duration:

```
<div
	class="accordion-content"
	use:slide={{isOpen, duration: 200}}
	on:animationEnd={() => console.log('animation ended')}
>
```
Note that use:slide now receives an objectt (double curly brace).

aaand in ```slide.js```:
- destructure received object ```export function slide(node, {isOpen, duration = 500}) {```, here with default duration as well.
- and in the animation, just call _duration_

```javascript
let animation = node.animate([
        {
            height: 0,
        }, {
            height: ```${initialHeight}px```
        }
    ],
        {
            duration, // default 500 ms, or different if passed in
            fill: 'both', // whichever direction the animation is run, it will remain in its final state when finished
            direction: isOpen ? 'reverse' : 'normal', // animation plays in reverse (open to height 0) if open, or forward (0 to open) when closed.
        }
    )
```


### Final files:

#### BetterAcordion.svelte
```
<script>
	import { slide } from './slide';
	export let buttonText = '';
	export let isOpen = true;
</script>

<button on:click={() => (isOpen = !isOpen)}>
	<span class:isOpen> &#9650; </span>
	{buttonText}
</button>
<div
	class="accordion-content"
	use:slide={{ isOpen, duration: 200 }}
	on:animationEnd={() => console.log('animation ended')}
>
	<div class="wrapper">
		<slot />
	</div>
</div>

<style>
	button {
		display: block;
		border: 0;
		width: 100%;
		text-align: left;
		border: solid 1px #333;
		margin: 0;
	}

	span {
		margin-right: 5px;
		display: inline-block;
		transform: rotate(0.25turn);
		transition: transform 0.3s ease;
	}

	.wrapper {
		padding: 20px;
	}

	.isOpen {
		transform: rotate(0.5turn);
	}

	.accordion-content {
		padding-left: 8px;
		border: solid 1px #333;
		border-top: 0;
	}
</style>
```

#### slide.js
```javascript
export function slide(node, {isOpen, duration = 500}) {
    // catalog initial height of the item. OffsetHeight is a DOM property that gives us the node height (a number, not in px)
    let initialHeight = node.offsetHeight;
    // catalog whether Accodrion is initially open or not. Set initially open by modifying the style property on the DOM node:
    node.style.height = isOpen ? 'auto' : 0; // auto if open, zero if closed
    // hide overflow as don't want any scrolling
    node.style.overflow = "hidden";

    let animation = node.animate([
        {
            height: 0,
        }, {
            height: ```${initialHeight}px```
        }
    ],
        {
            duration, // 500 ms
            fill: 'both', // whichever direction the animation is run, it will remain in its final state when finished
            direction: isOpen ? 'reverse' : 'normal', // animation plays in reverse (open to height 0) if open, or forward (0 to open) when closed.
        }
    )
    animation.pause();

    animation.onfinish = ({ currentTime }) => {
        // if animation in progress, reverse it and then stop
        if (!currentTime) {
            animation.reverse();
            animation.pause();
        }
        // if animation finishes, dispatch a cusotm event called animationEnd
        node.dispatchEvent(new CustomEvent('animationEnd'))
    }


    return {
        // update runs and returns a value whenver a property is udpated
        /*
       update: (isOpen) => {
            node.style.height = isOpen ? 'auto' : 0;
            console.log(isOpen);
        }
        */


        update: () => {
            console.log('animation.currentTime', animation.currentTime);
            animation.currentTime ? animation.reverse() : animation.play();
        }


    }
}
```
