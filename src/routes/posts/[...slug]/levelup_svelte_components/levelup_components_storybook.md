---
title: Storybook with Svelte Kit
date: '2023-08-03'
description: description
tags:
  - levelup
  - sveltekit
  - components
---
#[Storybook with Svelte Kit](https://levelup.video/tutorials/building-svelte-components/storybook-with-svelte-kit)

[Storybook](https://storybook.js.org/) allows you to document your components, and they recently released a specific [svelte module](https://storybook.js.org/blog/storybook-for-svelte/). It is largely seen as an environment where you can build and test components.

It looks for files with ```.stories``` in the extension, matching:  ```stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)']```. Running storybook with code up allows editing and tweaking of standalone components in real time. It also allows documentation of the components.

Let's start!

1. run ```npx sb init```, and ```y``` to proceed. It likes to be run inside a project, and indeed has detected the project type and installed vite, svelte and ESlint dependencies for me. On completion it:
	- creates an ```.storybook``` dir and ```src/routes/stories/``` with example code in.
	- runs ``` pnpm run storybook``` and fires up at [localhost://6006](http://localhost:6006/)

** The video is wrong from here on**

2. Create ```src/lib/Toggle.stories.js```.
3. Import Toggle component: ```import Toggle from './Toggle.svelte';```
4. Create defalult export

```javascript
export default {
    component: Toggle,
    tags: ['autodocs'],
    title: 'Toggle',
    argTypes: {
        onToggle: { action: 'onToggle' },
    },
};
```

Here:
- ```component``` is the component the story is associated with
- ```tags: ['autodocs']``` asks storybook to [automatically generate a docs page](https://storybook.js.org/docs/svelte/writing-docs/autodocs)
- ```title``` is the story name that appears in Storybook UI
- ```argTypes``` is an object that defines the arguments/props that can be bassed to the component (here, simply 'onToggle')

5. Define a template for the story:

```javascript
const Template = ({ onToggle, ...args }) => ({
    Component: Toggle,
    props: args,
    on: {
        toggle: onToggle,
    },
});
```

This creates a reusable template for the ```Toggle``` component that can be used in multiple stories, so different variations of Toggle can easily be created. Specifically:
- ```Component```: is the component the story is associated with
- ```props```: is an object comprising any arguments passed into _Template_ function
- ```on```: is an object including any event handlers passed into _Template_ function. Here, the _toggle_ event and the _onToggle_ event handler.

6. Create a ```Default``` story a named export:

```javascript
export const Default = Template.bind({});
Default.args = {
    on: false,
};
```

This:
- calls the _Template_ function for the component
- includes an object (```args```) that includes any arguments that can be passed in. Here, ```on: false```, meaning the toggle by default is set to off/false.

##[Storybook With Updating Props](https://levelup.video/tutorials/building-svelte-components/storybook-with-updating-props)

```javascript
export const WithLabel = Template.bind({});
WithLabel.args = {
    on: true,
    label: 'Toggle with label',
};
```

This uses the same template to create a story called 'WithLabel', with it set to on and a label preset.
