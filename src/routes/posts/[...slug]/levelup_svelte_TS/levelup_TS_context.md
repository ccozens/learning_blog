---
title: Context
date: '2023-08-03'
description: description
tags:
  - levelup
  - sveltekit
  - typescript
---
## [video](https://levelup.video/tutorials/svelte-and-typescript/context)

[Context in svelte](https://svelte.dev/docs/svelte#setcontext) is a way to pass data from parent to descendants without having to pass props through multiple component tree levels. To use context in svelte you need ```setContext``` in the parent ```getContext``` in the child.

##Setting and getting context
1. In parent (```+page.svelte```):

```
<script lang="ts">
	import { setContext } from 'svelte';

	setContext('current_position', 10);
</script>
```

2. In child (```Test.svelte```):

```
<script lang="ts">
	import { getContext } from 'svelte';
	const current_position = getContext('current_position');
</script>

<h4>
	Current position: {current_position}
</h4>

```

Outputs: ```Current position: 10```


## Typescript
In the above, ```const current_position = getContext('current_position');``` sets ```current_position``` as type unknown.

### Option 1: explicitly typed with generics
1. In parent ```setContext<number>('current_position', 10);```
2. In child ```const current_position = getContext<number>('current_position');```

This works but means manual typing, so isn't really typesafe and is error prone. However, it does help as it ensures that setting the context is the correct type (here, a number), and that the received context is a number.

### Option 2: define a type

1. Create new file ```src/lib/types.ts```:

```typescript
import type {Writable} from 'svelte/store';

export interface CurrentPositionContext {
    value: number;
    text: Writable<string>;
}
```

This object has 2 values: a value (number) and text ( a writable store). Context isn't inherently reactive, but can put a reactive store in it.

2. Use declared type, first in ```Test.svelte```:

```typescript
const current_position = getContext<CurrentPositionContext>('current_position');```
```

3. Then in ```+page.svelte```

```typescript
	setContext<CurrentPositionContext>('current_position', 10);
```

autoimport added, thanks TS: ```import type {CurrentPositionContext} from '$lib/types.js';```

4. Error! _Argument of type 'number' is not assignable to parameter of type 'CurrentPositionContext'._  Fair point, so update:

```typescript
setContext<CurrentPositionContext>('current_position', {
	value: 10,
	text: writable<string>('Hello world'),
	});
```

5. It now outputs _Current position: [object Object]_. D'oh! So, update ```Test.svelte```:


```
<h4>
	Current position: {current_position.value}
	Current position: {current_position.text}
</h4>
```

aaand we get
_Current position: 10 Current position: [object Object]_

The text is a store subscription, so we need to access the value.
Options:

1. Use [get](https://svelte.dev/docs/svelte-store#get) from svelte/store: ```Current position: {get(current_position.text)}``` (note need to import it)
2. Destructure on assignment: ```const {value, text } = getContext<CurrentPositionContext>('current_position');``` and then:

```
<h4>
	Current position: {value}
	Current position: {$text}
</h4>
```
Remember text is a subscribable store and so need $ to make it reactive.
