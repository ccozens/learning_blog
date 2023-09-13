---
title: Mobile first CSS
description: Notes on a Kevin Powell video 'Are you writing CSS the wrong way?'
date: 2023-09-12
tags:
    - css
    - mobile-first
---

[Kevin Powell - Are you writing CSS the wrong way?](https://www.youtube.com/watch?v=0ohtVzCSHqs)

## Intro

Mobile first CSS is the idea that you design for mobile first, then add media queries for larger screens. This is the opposite of the traditional approach of designing for desktop first, then adding media queries for smaller screens. Often, a mobile-first design is simple and it only needs fonts, colours and backgrounds and done.

Remember: bare HTML **is responsive**. Setting desktop styles undoes that responsiveness.

## The code

HTML from [css zen garden](http://csszengarden.com/), as this provides HTML and content with no styling.
I've coded along with Kevin [at this codepen](https://codepen.io/ccozens/pen/PoBvRGo).

### Initial styles

Some initial styles for typography, colours, some max-width so some contents don't get too wide.

```css
*,
*::before,
*::after {
	box-sizing: border-box;
}

h1,
h3 {
	font-weight: 900;
	line-height: 1;
}

h1 {
	font-size: 4rem;
	margin: 0;
}

h2 {
	margin: 0;
	text-transform: uppercase;
}

h3 {
	font-size: 2.5rem;
}

a {
	color: #f69333;
}

a:hover,
a:focus {
	color: rgb(96, 112, 116);
}

.sidebar a {
	color: rgb(96, 112, 116);
}

.sidebar a:hover {
	color: #f69333;
}

header {
	width: 100%;
	background: #92dff1;
	text-align: center;
	padding: 4em 0;
}

.summary {
	max-width: 600px;
	margin: 0 auto;
	text-align: center;
	opacity: 0.8;
	font-size: 0.95rem;
	padding: 1em 0;
}

.preamble {
	margin: 0 auto;
	background: #efefef;
	padding: 3em 2em;
	margin-bottom: 4em;
}

.preamble h3 {
	text-align: center;
}

.main {
	padding: 2rem;
}

.sidebar {
	background: #92dff1;
	padding: 2em;
}
```

None of this impacts the layout, apart from padding which he always adds when he adds a background colour.

## Why mobile first?

At this point, if the website is viewed in either desktop or mobile, its functional. It might not look the same but it looks basically fine. The same _is not true_ of desktop-first design.

## Desktop first coding

```css
.page-wrapper {
	display: flex;
	flex-wrap: wrap;
}
```

[flex-wrap: wrap;](https://developer.mozilla.org/en-US/docs/Web/CSS/flex-wrap) isn't always needed but this site was coded when float was commonly used and so it has divs you probably wouldn't use now. `flex-wrap: wrap;` breaks items into multiple lines where needed.

And then to create some columns:

```css
.main {
	width: 50%;
	margin-left: auto;
}

.sidebar {
	width: 30%;
	margin-right: auto;
}
```

`main` and `sidebar` are side-by-side, so `margin-left: auto;` on `main` and `margin-right: auto;` on `sidebar` does the same as `margin: 0 auto;` would do on a single element, ie centres them.

This breaks when scaled down, so would need something like:

```css
@media (max-width: 900px) {
	.page-wrapper {
		display: block;
	}

	.main,
	.sidebar {
		width: 100%;
	}
}
```

This exemplifies the problem with desktop-first design: you have to undo the desktop styles to get the mobile styles.

## Mobile first coding

Simply write a min-width media query with the inital styles in:

```css
@media (min-width: 900px) {
	.page-wrapper {
		display: flex;
		flex-wrap: wrap;
	}

	.main {
		width: 50%;
		margin-left: auto;
	}

	.sidebar {
		width: 30%;
		margin-right: auto;
	}
}
```

Its not just the same as a desktop site, and looks OK at small screen size.

## A trick: columns

```css
.preamble {
	/* set the number of columns */
	columns: 3;
	/* or could specify the size: columns: 100px; */
}

.preamble h3 {
	column-span: all;
}
```

This splits the preamble into 3 columns. `column-span: all;` makes the heading span all 3 columns.
[MDNs' definition for CSS columns is](https://developer.mozilla.org/en-US/docs/Web/CSS/columns) a shorthand property that: _sets the number of columns to use when drawing an element's contents, as well as those columns' widths._
[css-tricks' almanac entry for columns](https://css-tricks.com/almanac/properties/c/columns/) highlights that you can specify `column-count` and/or `column-width`, and recommends setting both for best responsiveness: _The column-count will act as the maximum number of columns, while the column-width will dictate the minimum width for each column._ It also suggests [break-inside](https://css-tricks.com/almanac/properties/b/break-inside/) to control how content breaks across columns.
