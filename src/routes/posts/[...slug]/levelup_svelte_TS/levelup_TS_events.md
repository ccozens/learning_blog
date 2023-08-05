---
title: Typing events
date: '2023-08-03'
description: typing events in sveltekit
tags:
    - levelup
    - sveltekit
    - typescript
---

## [Typing events video](https://levelup.video/tutorials/svelte-and-typescript/typing-events)

## on click

1. Add simple on click to `src/lib/Test.svelte`:

```
<script lang="ts">
    function on_click() {}
</script>

<button on:click={on_click}>Click me</button>
```

2. Cannot add inline handler as cannot use TS in svelte:
   `<button on:click={(event: Event) => on_click(event.target)}>Click me</button>` gives error on the event: Unexpected tokensvelte(parse-error), as cannot type types in svelte. So, need to declare functions in the script tag.

3. Updating the function to:

```
    function on_click(event) { // event is implict any
        console.log(event.currentTarget.innerText);
    }
```

works (button click prints "Click me" = the button's inner text), but get TS error as event is not typed.

4. So, update function by typing event:

```
   function on_click(event: Event) {
        console.log(event.currentTarget.innerText); // event.currentTarget is possibly null
    }
```

### Solution 1

5. So, update function to show event.currentTarget can be null:

```
   function on_click(event: Event) {
        console.log(event.currentTarget?.innerText); // innerText does not exist type EventTarget
    }
```

Here, TS does not know what type event.currentTarget is, and so does not know its properties.

6. So, tell TS what event.currentTarget is

```
   function on_click(event: Event) {
   const target = event.currentTarget as HTMLButtonElement
        console.log(target?.innerText); // innerText does not exist type EventTarget
    }
```

This cases event.currentTarget as an [HTMLButtonElement](https://microsoft.github.io/PowerBI-JavaScript/interfaces/_node_modules_typedoc_node_modules_typescript_lib_lib_dom_d_.htmlbuttonelement.html), and TS knows one of the properties is innerText, so all now good.

### Solution 2

7. Another solution is to specify the event type on the target itself:

```
    function on_click(event:Event & { currentTarget: EventTarget & HTMLButtonElement }) {
        console.log(event.currentTarget.innerText);
    }
```

Here, the more complex type definition tells TS what the event type it is expecting to receive is. This is probably more valid and secure than the casting solution.

## input

```
<script lang="ts">
    function on_input(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
        console.log(event.currentTarget.value);
    }
</script>

<input type="text" on:input={on_input}>
```

###currentTarget vs target
Note that this has to be `currentTarget`, not `target`, as [both are properties of the event object when listennind to an event, but they are not the same](https://thisthat.dev/current-target-vs-target/):

````
element.addEventListener('click', function (e) {
    // ```currentTarget``` and ```target``` are ```e```'s properties
});
````

Here:

-   `currentTarget` is the element that the event was bound to. It never changes. In the sample code above, `e.currentTarget` is the element.

-   `target` is the element user clicked on, in the case of click event. It can be the original element or any of its children depending on where user clicks on exactly.

###Why type delcaration is safer than casting

If mix and match:

```
script lang="ts">

function on_click(event:Event & { currentTarget: EventTarget & HTMLButtonElement }) {
        console.log(event.currentTarget.innerText);
    }
</script>

<h1>{name}</h1>


<input type="text" on:input={on_click}> // wrong handler called -> type error!
```

This throws a type error as TS knows it is expecting an HTMLButtonElement and it gets an HTMLInputElement.

## [Custom events](https://levelup.video/tutorials/svelte-and-typescript/custom-events)

You can create [custom event dispatches](https://svelte.dev/docs/svelte#createeventdispatcher) in Svelte. In react, calling a custom function on submit would look like:

```javascript
//react
<Test onSubmit={customFunction} />
```

In svelte, you can access the actual event dispatcher and gain access to all the standard properties:

```javascript
//react
<Test on:event />
```

1. In `src/lib/Test.svelte`:

```typescript
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
	 // need to run createEventDispatcher function to create a dispatch function
    const dispatch = createEventDispatcher();
</script>

<button on:click={() => dispatch('play')}>Me first! </button>
```

This dispatches a function called play. So, create it:

2. In `src/routes/+page.svelte`:

```typescript
<script lang="ts">
	function on_play(event) {
		console.log('event:' event);
	}
</script>


<Test {name} on:play={on_play}/>
```

Clicking this button prints a _CustomEvent_, with _type: 'play'_. This is a svelte event, not a JS event. `createEventDispatcher` passes in other properties not present in JS events, such as _detail_, which allows passing data.

3. For example, update the button in `src/lib/Test.svelte`:

```typescript
<button
	on:click={() =>
		dispatch('play', {
			player_status: 'PLAY'
		})
	}
>
	Me first!{' '}
</button>
```

Clicking button and printing `event` now prints:

```text
_CustomEvent_ -> _detail:
player_status : "PLAY"_
```

This is where TS comes into use: to type check the data passed when accessing the event.

4. Through all this, _event_ in `function on_play(event) {` is throwing a type error. Heading back to `src/lib/Test.svelte`, we can define the event as a generic:

```typescript
const dispatch = createEventDispatcher<{ play: { player_status: 'PLAY' | 'STOP' } }>();
```

This tells TS that the play event will receive an object _player_status_ whose values are `PLAY` or `STOP`. This doesn't solve anything in `+page.svelte` because `function on_play` doesn't know anything about the event. So, hover over _play_ in `<Test {name} on:play={on_play}/>` and it tells you the event to type. Hover text = `play: CustomEvent<{ player_status: "PLAY" | "STOP"; }>`

So:

```typescript
function on_play(event: CustomEvent<{ player_status: 'PLAY' | 'STOP' }>) {
	console.log('event', event.detail.player_status);
}
```

This tells TS event is a CustomEvent which will contain _player_status_ with either _PLAY_ or _STOP_ strings. The hover text for `on:play` now reads: `play: CustomEvent<{ player_status: "PLAY" | "STOP"; }>`

Everything is now completely typed. Its a 2 step process:

1. type where the event is dispatched (here, `Test.svelte`)
2. type where the function comes in (here, `+page.svelte`)
