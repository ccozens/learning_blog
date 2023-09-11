---
title: CSS variables
description: CSS custom properties, often called CSS variables, are entities defined as CSS that can easily be dynamically updated using JavaScript.
date: 2023-09-11
tags:
    - css
    - css variables
    - custom properties
---

[CSS variables, properly called custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties), are a way to store and reuse values in CSS. They are declared in the root of the CSS file, and can be used anywhere in the CSS file. They are declared with a double dash, and

## var function

CSS variables are used with the [var() function](https://developer.mozilla.org/en-US/docs/Web/CSS/var), which inserts the given value of a custom property into the CSS.

```css
/* Simple usage */
var(--custom-prop);

/* With fallback */
var(--custom-prop,);  /* empty value as fallback */
var(--custom-prop, initial); /* initial value of the property as fallback */
var(--custom-prop, #FF0000);
var(--my-background, linear-gradient(transparent, aqua), pink);
var(--custom-prop, var(--default-value));
var(--custom-prop, var(--default-value, red));
```

The first argument to the function is the name of the custom property to be substituted. An optional second argument to the function serves as a fallback value. If the custom property referenced by the first argument is invalid, the function uses the second value.

## Declaring CSS variables

CSS variables are declared in the root of the CSS file, and can be used anywhere in the CSS file. They are declared with a double dash, and can be used with the var() function.

```css
:root {
	--main-bg-color: brown;
	--main-text-color: white;
}

body {
	background-color: var(--main-bg-color);
	color: var(--main-text-color);
}
```

## Using CSS variables in JavaScript

CSS variables can be accessed and changed in JavaScript using the [CSSStyleDeclaration.getPropertyValue()](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/getPropertyValue) and [CSSStyleDeclaration.setProperty()](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/setProperty) methods.

```javascript
const rootStyles = getComputedStyle(document.documentElement);
const mainBgColor = rootStyles.getPropertyValue('--main-bg-color');
document.documentElement.style.setProperty('--main-bg-color', 'blue');
```

## Using CSS variables in HTML

CSS variables can be used in HTML with the [var()](https://developer.mozilla.org/en-US/docs/Web/CSS/var) function.

```html
<div
	style="
    --main-bg-color: brown;
    --main-text-color: white;"
>
	<p
		style="
      background-color: var(--main-bg-color);
      color: var(--main-text-color);"
	>
		Hello world!
	</p>
</div>
```
