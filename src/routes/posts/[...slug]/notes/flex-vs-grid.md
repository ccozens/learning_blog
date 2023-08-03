---
title: Flexbox vs grid
date: '2023-07-31'
description: description
tags:
  - css
---
# Flexbox vs grid

Notes on [Kevin Powell's video](https://www.youtube.com/watch?v=3elGSZSWTbM)
[Kevin's example CodePen](https://codepen.io/kevinpowell/pen/mdBzaop)
[My fork](https://codepen.io/ccozens/pen/OJBREwL?editors=0100)

<hr />
<h4> Do I want to be relying on intrinsic sizing of content, or do I want structured control from the parent's perspective? </h4>
<hr />

## What's the difference?

- both can perform similar functions
- Flex sets itself up as a one dimensional grid, meaning the columns in different rows are independent widths.
- Grid is inherently two-dimensional, meaning all grid boxes will be fixed-size rows and columns.


### [nav example](https://codepen.io/ccozens/pen/OJBRaWX)
Flex excels here as it defaults to a row with each element sized intrinsically (ie each element is a good size for the link content, larger or smaller as appropriate). Switching on `flex-wrap: wrap` allows the elements to wrap onto subsequent columns

### [cards example](https://codepen.io/ccozens/pen/MWPjzbQ?editors=0100)
Grid excels when want rigid behaviour from the parent, eg for structured layouts.

## Flex
- switch on and snaps to columns
- every direct child will become a column, so can get horizontal scrolling
- default behaviour:

```css
.flex-container {
  display: flex;
  flex-direction: row;
}
```
Flexbox is really good at intrinsic sizing, ie shrinking each box to fit content.

### Flex children
Need to change properties of flex children to impact how they behave, eg:
 `.flex-container > *` selects every direct child of .flex-container
 `flex-grow: 1`:
 `flex-basis: 33%`: each flex child takes up 33% of the space (ie 3 columns)


```css
.flex-container > * {
  flex-grow: 1;
  flex-basis: 33%;

}
```

## Grid
- default behaviour very similar to flex above.
- very good at setting fixed sizes

```css
.grid-container {
  display: grid;
  grid-auto-flow: row
 }
```

- grid autofit allows setting smallest and largest sizes. This means grid will change number of columns depending on size.

```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
 }
```


## Mixing
The [cards example](https://codepen.io/ccozens/pen/MWPjzbQ?editors=0100) has tags controlled by flexbox within a grid. Great idea!
