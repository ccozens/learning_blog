---
title: Astro components
date: '2023-07-31'
description: Intro to Astro components, including JS in frontmatter, styling and CSS variables
tags:
  - astro
  - components
---

JavaScript

### JS between in [frontmatter](https://docs.astro.build/en/core-concepts/astro-components/#the-component-script) vs [client-side](https://docs.astro.build/en/core-concepts/astro-components/#client-side-scripts)

JS in .astro frontmatter (ie between code fences ---) is run at build time.
JS in `<script>` tags is sent to the browser and to run client-side (eg to add interactivity to the page).

First add JS between `---` markers at head of .astro page:

```javascript
---
const pageTitle = 'About Me';

const identity = {
  firstName: 'Chris',
  lastName: 'Cozens',
  country: 'UK',
  occupation: ['molecular biologist', 'full stack developer'],
};

const skills = [
  'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Astro', 'writing docs',
];
---
```

Then inject as for JSX:

```html
<h1>{pageTitle}</h1>
<ul>
      <li>My name is {identity.firstName}.</li>
      <li>
        I live in {identity.country} and I am a {
          identity.occupation[0]
        } and {identity.occupation[1]}.
      </li>
    </ul>
    <p>My skills are:</p>
    <ul>
      {skills.map((skill) => <li>{skill}</li>)}
    </ul>

    {happy && <p>I am happy to be learning Astro!</p>}
```

## [Styling](https://docs.astro.build/en/guides/styling/#styling-in-astro)

The Astro `<style>` tag is scoped by default, meaning that it only affects the elements in its own file.

```html
<style>
  h1 {
    color: purple;
    font-size: 4rem;
  }
</style>
```

### Styling with JavaScript

First the style:

```html
 .skill {
    color: green;
    font-weight: bold;
    }
```

Then in the HTML:

```html
<ul>
  {skills.map((skill) => <li class="skill">{skill}</li>)}
</ul>
```

### [Using CSS variables](https://docs.astro.build/en/guides/styling/#css-variables)

Define colour in JS:

```javascript
const skillColour = "navy";
```

Then inject `define:vars={{skillColour}}` into style declaration the style, and update color to use the colour `color: var(--skillColor)`:

```html
<style define:vars={{skillColour}}>

 .skill {
    color: var(--skillColor);
    font-weight: bold;
    }
</style>
```

And leave the JSX:

```html
<ul>
  {skills.map((skill) => <li class="skill">{skill}</li>)}
</ul>
```

And the skillColour variable is now passed to the define:vars directive and the skills colour is `skillColour`.

### Global styling

This can be done various ways - tutorial uses `global.css` that is then imported to each page.

1. Create `src/styles/global.css`
2. Add CSS

```css
html {
  background-color: #f1f5f9;
  font-family: sans-serif;
}

body {
  margin: 0 auto;
  width: 100%;
  max-width: 80ch;
  padding: 1rem;
  line-height: 1.5;
}

* {
  box-sizing: border-box;
}

h1 {
  margin: 1rem 0;
  font-size: 2.5rem;
}
```

3. Import to each page at top of frontmatter:

```javascript
---
import '../styles/global.css';
```
*