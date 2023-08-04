---
title: Actions
date: '2023-08-03'
description: Typing actions in SvelteKit
tags:
  - levelup
  - sveltekit
  - typescript
  - actions
---
## [video](https://levelup.video/tutorials/svelte-and-typescript/actions)

[Svelte Actions](https://svelte.dev/docs/svelte-action) are functions that are called when an element is created. The ```use``` directive can be used to create lifecycle methods on DOM elements, and be able to access DOM elements and control them without creating a component.

They can be returned with ```destroy``` or ```update``` methods, and can take parameters, which can be updated if the returned value has an ```udpate``` method. From the docs:

```typescript
<script lang="ts">
  import type { Action } from 'svelte/action';

  export let bar: string;

  const foo: Action<HTMLElement, string> = (node, bar) => {
    // the node has been mounted in the DOM

    return {
      update(bar) {
        // the value of ```bar``` has changed
      },

      destroy() {
        // the node has been removed from the DOM
      },
    };
  };
</script>

<div use:foo={bar} />
```


##Click outside action
This is the sort of action you would have in a modal, where nothing happens when you click on the element and fires when you click outside the element.

1. Create ```code src/lib/click_outside.ts```
2. Work in ```src/routes/Header.svelte```
3. Create script tag and import click_outside:

```
<script lang="ts">
	import { click_outside } from "$lib/click_outside";
</script>
```


4. use it:

```
<header use:click_outside>
	<h1><a href="/">Syntax Podcast</a></h1>
</header>
```

5. TS error! _(alias)

```typescript
click_outside(): {
    destroy(): void;
}
import click_outside_
```

Not surprising as haven't defined what the action does yet.
6. Back in ```click_outside.ts```, TS needs a workaround to get the type definition correct:

```
import type { Action } from 'svelte/action';



export const click_outside: Action = function () {

    return {
        destroy() {
            // runs whenver action is destroyed (e.g. element is removed from DOM)
        }
    }
}
```

7. Now, when add paramaters to click_outside: ```export const click_outside: Action = function (node) {```, TS correctly assigns the type to node: _(parameter) node: Node extends HTMLElement_
8.
9. Now define the action behaviour:

```
export const click_outside: Action = function (node) {

    // initiliaze the click handler
    const handleClick = function () {
        console.log('click outside');
    };

    // add the event listener
    document.addEventListener('click', handleClick), true;
    return {
        destroy() {
            // runs whenver action is destroyed (e.g. element is removed from DOM)
            document.removeEventListener('click', handleClick), true;
        }
    }
}
```

9. Function now runs anywhere we click on screen. This is because ```document.addEventListener``` adds the eventListener to the whole document, obvs. So, update handleClick:

```
const handleClick = function (event: MouseEvent) {
    if (node.contains(event.target)) {
        console.log('click outside');
    }
};
```

Here, we have added an event of type _MouseEvent_ and checks whether current node contains the event.target. If so, click. This now clicks when we click the header, so invert logic:

```
const handleClick = function (event: MouseEvent) {
    if (!node.contains(event.target)) {
        console.log('click outside');
    }
};
```

10. It now works and fires when click outside the header! However, ```event.target``` has an error: _Argument of type 'EventTarget | null' is not assignable to parameter of type 'Node | null'._  TS says the event target could be a Node, but it isn't necessarily, so [type narrow with intanceof](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#instanceof-narrowing):

```
const handleClick = function (event: MouseEvent) {
    if (event.target instanceof Element) {
        if (!node.contains(event.target)) {
            console.log('click outside');
        }
    };
}
```

_instanceof_ is your friend for mysterious errors, as it specifically asks TS to check whether or not a value is an "instance" of another value. Here, we are checking that event.target is an instance of Element (ie it is not null, and that the prototype chain of event.target contains Element.


```cmd + click``` to follow links
```cmd .``` autofix? eg ```function is not defined```, and will add import
```shift option o```: organize imports

##[Custom events on actions](https://levelup.video/tutorials/svelte-and-typescript/custom-events-on-actions)

Sometimes actions emit custom events and apply custom attributes to the element they are applied to. To support this, actions typed with ```Action``` or ```ActionReturn``` type can have a last parameter, [Attributes](https://svelte.dev/docs/svelte-action#attributes):

```typescript
// from the docs
<script lang="ts">
  import type { Action } from 'svelte/action';

  const foo: Action<
    HTMLDivElement,
    { prop: any },
    { 'on:emit': (e: CustomEvent<string>) => void }
  > = (node, { prop }) => {
    // the node has been mounted in the DOM

    //...LOGIC
    node.dispatchEvent(new CustomEvent('emit', { detail: 'hello' }));

    return {
      destroy() {
        // the node has been removed from the DOM
      },
    };
  };
</script>

<div use:foo={{ prop: 'someValue' }} on:emit={handleEmit} />
```

1. update above function to add custom event dispatch:

```typescript
const handleClick = function (event: MouseEvent) {
    // check event.target is an instance of Element
    if (event.target instanceof Element) {
        if (!node.contains(event.target)) {
            node.dispatchEvent(
                new CustomEvent('click-outside', {detail: 'Detects a click outside of the element'}
                )
            )
        }
    };
}
```

[dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent) and [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent) are node APIs. Specifically, dispatchEvent is a method of [EventTarget](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/EventTarget), just like [addEventListener()](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) and [removeEventListener()](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener).

So, this code fires a custom event directly from the action.

2. Call the event from ```Header.svelte```:

```
<script lang="ts">
	import { click_outside } from "$lib/click_outside";

	function click(e) {
		console.log(e);
	}
</script>

<header use:click_outside on:click-outside={click}>
	<h1><a href="/">Syntax Podcast</a></h1>
</header>
```

Here, using the ```click_outside``` action gives access to the ```on:click-outside``` event and that fires the function ```click```. Lots of red squiggly because TS doesn't know what the ```click``` function is, or what the ```click-outside``` event is.  Crucially, it does work, and console logs when clicks outside the header only.

3. Types! First, let the action know that there is an event called click-outside that exists on the object. In ```click_outside.ts```, below import and above click_outside declaration, declare an interface:

```typescript
interface Attributes {
    'on:click-outside'?: (event: CustomEvent<string>) => void;
}
```

This states that the ```on:click-outside``` exists, is optional, it is a custom event and has no return.

4. To apply, pass it into the Action type. The Action type declaration is:
```(alias) interface Action<Element = HTMLElement, Parameter = any, Attributes extends Record<string, any> = Record<never, any>>```

Note: Attributes! which is a [Record](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type) consisting _<string, any>_.

So, now update ```click_outside```:

```typescript
export const click_outside: Action<HTMLElement, any, Attributes> = function (node) {
// ...as before
```

So, here HTMLElement and any are unchanged, then you can supply Attributes.

In ```Header.svelte```, the line ```<header use:click_outside on:click-outside={click}>``` now has no red lines meaning TS accepts the types. Indeed, hovering over ```on:click-outside``` shows _(property) Attributes['on:click-outside']?: ((event: CustomEvent<string>) => void) | undefined_.

5. There is still an error in the script tag, which is solved by declaring the event passed into ```click``` as a _CustomEvent_:

```typescript
function click(e: CustomEvent) {
		console.log(e);
	}
```
