---
title: Project walkthrough
date: '2023-08-03'
description: description
tags:
  - levelup
  - sveltekit
  - typescript
---

Install project: ```git clone https://github.com/leveluptuts/svelte-typescript-course-start.git```

> #### Remember to create ```.env.``` containing:
>
> ```javascript
> LUT_API='asdfasdfasdf'
> PUBLIC_LUT_PUB_KEY='iampublic'
> ```

### jsconfig.json

This is essentially a tsconfig file, so can simply rename to ```tsconfig.json```.
It begins ```"extends": "./.svelte-kit/tsconfig.json",``` -> this can be option+clicked to see contents.

### Two ways to convert files to TS in SK:
1. Can rename ```.js``` -> ```.ts``` and its now a TS file.
2. ```.svelte``` file extensions stay same, and change *script* tag: ```<script lang="ts">```

Doing this usually means red squigglies appear! Working through to remove these will mean the file is typesafe - this doesn't mean there won't be bugs, but it reduces places where there could be bugs.
