---
title: Rendering markdown Rendering markdown with remark
description: Using remark and rehype to render svelte pages from markdown
date: '2023-07-25'
tags:
    - markdown
    - learning
    - this_site
    - remark
    - rehype
---

Version 1 of markdown rendering for this site used the [unified ecosystem](https://unifiedjs.com). I moved onto [mdsvex](https://mdsvex.pngwn.io/), as it was simpler to pre-render the markdown, allows extensability (should I ever want to make us of full mdx capabilities, good to know its there ready) and frankly I found far more posts helping me get it up and running.

I have kept this section on unified as I learnt a lot doing it and enjoyed the experience exploring the unified ecosystem. So: unified consists a core module that acts as an interface to convert markdown into structured data ([syntax trees](https://github.com/syntax-tree)), and so make it available to plugins as a consistent datatype. Three signficant ecosystems within unified are [remark for markdown](https://unifiedjs.com/explore/project/remarkjs/remark/), [rehype for HTML](https://unifiedjs.com/explore/project/rehypejs/rehype/), and [retext for natural language](https://unifiedjs.com/explore/project/retextjs/retext/).

The [unified package itself](https://unifiedjs.com/explore/package/unified/) provides an interface for processing context with syntax trees, that are modified by the plugins. Typically, a syntax tree requires:

-   a parser, to get the syntax tree from text
-   a transformer, to modify the syntax tree
-   a compiler, to return to text in the format of choice

From [the unified docs](https://unifiedjs.com/learn/guide/introduction-to-unified/#how-it-comes-together):

> These processors, specifications, and tools come together in a three part act. The process of a processor:

> **Parse**: Whether your input is Markdown, HTML, or prose — it needs to be parsed to a workable format. Such a format is called a syntax tree. The specifications (for example mdast) define how such a syntax tree looks. The processors (such as remark for mdast) are responsible for creating them.
> **Transform**: This is where the magic happens. Users compose plugins and the order they run in. Plugins plug into this phase and transform and inspect the format they get.
> **Stringify**: The final step is to take the (adjusted) format and stringify it to Markdown, HTML, or prose (which could be different from the input format!)

## Process

I loosely followed the [unifiedjs guide](https://unifiedjs.com/learn/guide/using-unified/), with a few additions. I used:

-   [unified](https://github.com/unifiedjs): the core package from [unifiedjs](https://unifiedjs.com/), which is a collection of packages to process text with plugins.
-   [remark parse](https://github.com/remarkjs/remark-parse): parses Markdown into an abstract syntax tree (AST), a structured representation of the content. The [Markdown Abstract Syntax Tree (mdast) spec is here](https://github.com/syntax-tree/mdast).
-   [remark frontmatter](https://github.com/remarkjs/remark-frontmatter): separates frontmatter from the main markdown.
-   [remark parse frontmatter](https://github.com/remarkjs/remark-frontmatter): parses frontmatter into an easily-accessabe object.
-   [remark GFM](https://github.com/remarkjs/remark-gfm): enables use of GitHub Flavoured Markdown (GFM), such as task liss, tables, strikethroughs.
-   [remark rehype](https://github.com/remarkjs/remark-rehype): transforms the MDAST created by remark parse into a HAST that can be serialized as HTML. The [Hypertext Abstract Syntax Tree format spec is here](https://github.com/syntax-tree/hast).
-   [rehype stringify](https://github.com/remarkjs/remark-rehype-stringify): parses the new AST into HTML
-   [rehype prism plus](https://www.timlrx.com/blog/creating-a-rehype-syntax-highlighting-plugin): modified version of the [rehype prism plugin](https://github.com/mapbox/rehype-prism), which highlights code blocks using the [Prism syntax highlighter](https://prismjs.com/). I used this version as it has added functionaliy such as line numbering.

1. Add packages: ``pnpm add unified unified-stream remark-parse remark-rehype rehype-stringify remark-gfm remark-frontmatter```
2. Create `src/lib/functions/RenderMarkdown.ts`
3. Imports:

```typescript
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkFrontmatter from 'remark-frontmatter';
import remarkParseFrontmatter from 'remark-parse-frontmatter';
import remarkRehype from 'remark-rehype';
import remarkGfm from 'remark-gfm';
import rehypeStringify from 'rehype-stringify';
import rehypePrism from 'rehype-prism-plus';
```

4. Define processor function

```typescript
const processor = unified()
	.use(remarkParse)
	.use(remarkFrontmatter, ['yaml'])
	.use(remarkParseFrontmatter, { type: 'yaml', marker: '-' })
	.use(remarkGfm)
	.use(remarkRehype)
	.use(rehypeStringify)
	.use(rehypePrism, { showLineNumbers: true });
```

This defines the `processor` function using the unified() lilbrary and comprises several plugins to parse, transform and seralize Markdown content.

5. define actual renderMarkdown function:

```typescript
export const renderMarkdown = async (
	markdown: string
): Promise<{ frontmatter: any; html: string }> => {
	return new Promise<{ frontmatter: any; html: string }>((resolve, reject) => {
		processor.process(markdown, (err, file) => {
			if (file) {
				if (err) {
					reject(err);
					return;
				} else {
					resolve({
						frontmatter: file.data.frontmatter,
						html: file.toString()
					});
				}
			}
		});
	});
};
```

`renderMarkdown` takes a markdown string and returns a promise, which in turn will resolve to an object containing a _frontmatter_ object (containing the yaml frontmatter) an and _html_ string (consisting the parsed, formatted, and stringified markdown content).

6. I created `test.md` to test a few markdown features:

`````markdown
    ---
    "title": "Test"
    "description": "This is a test"
    "tags": ["test", "test2"]
    ---

    # I am markdown

    ## Call me a test

    - beep
    1. numbers
    2. more
    3. more

    A link! [link](http://google.com)

    Code!

    ```js
    const test = 'test';
    const test2 = 'test2';
    const test + test2 = 'test3';
    ````

    ```typescript
    var test:string = 'test';
    ```

    ```python
    test = 'test'
    ```
`````

7. Finally `+page.svelte` to render the markdown:

```svelte
<script lang="ts">
	import './codeThemeNightOwl.css';

	import type { PageData } from './$types';

	export let data: PageData;

	const { title, description, tags } = data.frontmatter;
	const html = data.html;
</script>

<h1>You're here!</h1>

<h2>{title}</h2>
<h3>{description}</h3>
<div>{tags}</div>

<p>Here's the content:</p>
{#if html}
	{@html html}
{:else}
	<p>loading...</p>
{/if}
```

8. Actually, finally is adding the CSS! It turns out rehype prism plus as I had implemented it didn't include CSS to format the code blocks, so first I imported the [Prismjs Night Owl theme](https://github.com/PrismJS/prism-themes/blob/master/themes/prism-night-owl.css) into its own file, and then added some css to show the line numbers, as they were not present in the imported them:

```css
.line-number::before {
	content: attr(line);
	padding-right: 1em;
	font-size: 0.6em;
	opacity: 0.4;
}
```

<details>
<summary>Full theme here</summary>

```css
/*  https://github.com/PrismJS/prism-themes/blob/master/themes/prism-night-owl.css */

/**
 * MIT License
 * Copyright (c) 2018 Sarah Drasner
 * Sarah Drasner's[@sdras] Night Owl
 * Ported by Sara vieria [@SaraVieira]
 * Added by Souvik Mandal [@SimpleIndian]
 */

code[class*='language-'],
pre[class*='language-'] {
	color: #d6deeb;
	font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
	text-align: left;
	white-space: pre;
	word-spacing: normal;
	word-break: normal;
	word-wrap: normal;
	line-height: 1.5;
	font-size: 1em;

	-moz-tab-size: 4;
	-o-tab-size: 4;
	tab-size: 4;

	-webkit-hyphens: none;
	-moz-hyphens: none;
	-ms-hyphens: none;
	hyphens: none;
}

pre[class*='language-']::-moz-selection,
pre[class*='language-'] ::-moz-selection,
code[class*='language-']::-moz-selection,
code[class*='language-'] ::-moz-selection {
	text-shadow: none;
	background: rgba(29, 59, 83, 0.99);
}

pre[class*='language-']::selection,
pre[class*='language-'] ::selection,
code[class*='language-']::selection,
code[class*='language-'] ::selection {
	text-shadow: none;
	background: rgba(29, 59, 83, 0.99);
}

@media print {
	code[class*='language-'],
	pre[class*='language-'] {
		text-shadow: none;
	}
}

/* Code blocks */
pre[class*='language-'] {
	padding: 1em;
	margin: 0.5em 0;
	overflow: auto;
}

:not(pre) > code[class*='language-'],
pre[class*='language-'] {
	color: white;
	background: #011627;
}

:not(pre) > code[class*='language-'] {
	padding: 0.1em;
	border-radius: 0.3em;
	white-space: normal;
}

.token.comment,
.token.prolog,
.token.cdata {
	color: rgb(99, 119, 119);
	font-style: italic;
}

.token.punctuation {
	color: rgb(199, 146, 234);
}

.namespace {
	color: rgb(178, 204, 214);
}

.token.deleted {
	color: rgba(239, 83, 80, 0.56);
	font-style: italic;
}

.token.symbol,
.token.property {
	color: rgb(128, 203, 196);
}

.token.tag,
.token.operator,
.token.keyword {
	color: rgb(127, 219, 202);
}

.token.boolean {
	color: rgb(255, 88, 116);
}

.token.number {
	color: rgb(247, 140, 108);
}

.token.constant,
.token.function,
.token.builtin,
.token.char {
	color: rgb(130, 170, 255);
}

.token.selector,
.token.doctype {
	color: rgb(199, 146, 234);
	font-style: italic;
}

.token.attr-name,
.token.inserted {
	color: rgb(173, 219, 103);
	font-style: italic;
}

.token.string,
.token.url,
.token.entity,
.language-css .token.string,
.style .token.string {
	color: rgb(173, 219, 103);
}

.token.class-name,
.token.atrule,
.token.attr-value {
	color: rgb(255, 203, 139);
}

.token.regex,
.token.important,
.token.variable {
	color: rgb(214, 222, 235);
}

.token.important,
.token.bold {
	font-weight: bold;
}

.token.italic {
	font-style: italic;
}

.line-number::before {
	content: attr(line);
	padding-right: 1em;
	font-size: 0.6em;
	opacity: 0.4;
}
```

</details>

## A note on typescript.

This function is not typesafe as it stands, as it defines frontmatter as `any`. Actually, frontmatter is unknown. To ensure type safety, I have declared a front matter type:

```typescript
interface Frontmatter {
	title: string;
	description: string;
	tags: string[];
}
```

A function to test for Frontmatter:

```typescript
function isFrontmatter(obj: unknown): obj is Frontmatter {
	const fm = obj as Frontmatter;
	return (
		typeof fm.title === 'string' &&
		typeof fm.description === 'string' &&
		Array.isArray(fm.tags) &&
		fm.tags.every((tag) => typeof tag === 'string')
	);
}
```

And then called the function within `renderMarkdown` to ensure frontmatter is Frontmatter:

```typescript
export const renderMarkdown = async (
	markdown: string
): Promise<{ frontmatter: Frontmatter; html: string }> => {
	return new Promise<{ frontmatter: Frontmatter; html: string }>((resolve, reject) => {
		processor.process(markdown, (err, file) => {
			if (file) {
				if (err) {
					reject(err);
					return;
				} else {
					if (!isFrontmatter(file.data.frontmatter)) {
						reject(new Error('Frontmatter is invalid'));
						return;
					}
					resolve({
						frontmatter: file.data.frontmatter,
						html: file.toString()
					});
				}
			}
		});
	});
};
```
