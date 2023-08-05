---
title: Rendering markdown with mdsvex
description: Using mdsvex to render svelte pages from markdown
date: 2023-08-05
tags:
    - markdown
    - learning
    - this_site
    - mdsvex
    - sveltekit
---

This is v2 of markdown rendering, using mdsvex, largely as [Josh Collinsworth's great tutorial](https://joshcollinsworth.com/blog/build-static-sveltekit-markdown-blog) explained the basics of exactly what I was trying to do: namely, set up a blog that renders markdown files in sveltekit with slugs and tags (or categories, as he calls them).

I've tweaked a little, mostly as I'm using TypeScript and replacing a few ```+page.js``` with ```+.page.server.ts``` as I want the posts to pre-render server-side and don't need to fetch from an external API. [SvelteKit's docs on when to universal vs server pages](https://kit.svelte.dev/docs/load#universal-vs-server-when-to-use-which) say:

> Server load functions are convenient when you need to access data directly from a database or filesystem, or need to use private environment variables.

> Universal load functions are useful when you need to fetch data from an external API and don't need private credentials, since SvelteKit can get the data directly from the API rather than going via your server. They are also useful when you need to return something that can't be serialized, such as a Svelte component constructor.

*Universal load functions* run on ```+page.ts```, where *server load functions* run on ```+page.server.ts```.

## Folder structure

I ended up with:

```bash
.
├── README.md
├── svelte.config.ts
├── tsconfig.json
├── vite.config.js
├── lib
│   ├── components
│   │   ├── PostListWithPreview.svelte
│   │   ├── SinglePost.svelte
│   │   └── TagCloud.svelte
│   ├── functions
│   │   ├── GetAllTags.ts
│   │   └── FormatDate.ts
│   ├── styles
│   │   └── code-prism-night-owl.css
│   └── types
│       ├── githubIssue.ts
│       ├── index.ts
│       └── posts.ts
└── routes
    ├── +layout.server.ts
    ├── +page.svelte
    ├── api
    │   └── posts
    │       └── +server.ts
    └── posts
        ├── +layout.server.ts
        ├── +page.svelte
        ├── [...slug]
        │   ├── +page.server.ts
        │   └── +page.svelte
        │   └── testDir
        │       └── test.md
        └── tags
            ├── +page.server.ts
            ├── +page.svelte
            └── [tag]
                ├── +page.server.ts
                └── +page.svelte
```

## File summary

### Root dir

#### svelte.config.js

This config file is used by svelte and other tooling in the project. Contains [svelte and sveltekit configuration options](https://kit.svelte.dev/docs/configuration).

- as standard, it configures [vitePreprocess](https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/preprocess.md). [Preprocessors](https://kit.svelte.dev/docs/integrations#preprocessors) transform ```.svelte``` files before passing them to Svelte compiler. For example and is what enables ```<script lang="ts">``` tags to automatically transform TypeScript to JavaScript for the compiler.

- [mdsvex](https://mdsvex.pngwn.io/docs#mdsvex-1) is a markdown preprocessor and so runs here. It requires adding as a plugin and extensions specifying. I also added [remark code titles]([GitHub - mottox2/remark-code-titles](https://github.com/mottox2/remark-code-titles#readme)) here to allow parsing of file names in code fences.

- the extensions array lists the file types that should be treated as Svelte components. By default, this is only ```.svelte```.

```javascript:svelte.config.js
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/kit/vite';
import { mdsvex } from 'mdsvex';
import codeTitle from 'remark-code-titles';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: [
        vitePreprocess(), // default
        mdsvex({ // added mdsvex to preprocess array
            extensions: ['.md'], // specified .md files only
            remarkPlugins: [codeTitle] // added codeTitle as a remark plugin
    })
    ],
    extensions: ['.svelte', '.md'], // tells svelte to treat .md files as components
    kit: {
        adapter: adapter()
    }
};

export default config;
```

#### vite.config.ts

A svelte project is a vite project with the [@svelte/kit/svelte plugin](https://kit.svelte.dev/docs/modules#sveltejs-kit-vite), so it contains and requires a [vite config file](https://vitejs.dev/config/). The only change here is to add an [assetsInclude property](https://vitejs.dev/config/shared-options.html#assetsinclude) that specifies files to be treated as static assets, meaning:

- They will be excluded from the plugin transform pipeline when referenced from HTML or directly requested over ```fetch``` or XHR.

- Importing them from JS will return their resolved URL string (this can be overwritten if you have a ```enforce: 'pre'``` plugin to handle the asset type differently).

Default extensions are: ```.mjs```, ```.js```, ```.mts```, ```.ts```, ```.jsx```, ```.tsx```, ```.json```

```typescript:vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [sveltekit()],
    assetsInclude: 'src/**/*.md' // addition to include all .md files in all subfolders of src folder
});
```

#### tsconfig.json

TypeScript configuration file that extends sveltekit's defaults. Not essential here, but for the record:

```json:tsconfig.json
{
    "extends": "./.svelte-kit/tsconfig.json",
    "compilerOptions": {
        "allowJs": true,
        "checkJs": true,
        "esModuleInterop": true,
        "forceConsistentCasingInFileNames": true,
        "resolveJsonModule": true,
        "skipLibCheck": true,
        "sourceMap": true,
        "strict": true
    }
}
```

### lib/components

Components used for displaying data.

#### PostListWithPreview.svelte

Displays a list of posts with title, description and data from frontmatter

```typescript:PostListWithPreview.svelte
<!-- script -->
<script lang='ts'>
    import type { Post } from '$lib/types';
	import {sortUserPlugins} from 'vite';
	import TagCloud from './TagCloud.svelte';

    export let posts: Post[] = [];
</script>

<!-- html -->


{#each posts as post}
    <article>
        <!-- note the /posts in the <a> element - makes it absolute link (/posts/slug) rather than relative (/posts/tags/posts/slug) -->
        <h1><a href="/posts/{post.slug}">{post.metadata.title}</a></h1>
        <p class="preview">{post.metadata.description}</p>
        <p>Posted on {post.dateFormatted}</p>
        <TagCloud tags={post.metadata.tags} />
    </article>
{/each}


<style>
    .preview {
        text-transform: capitalize;
    }
</style>
```

#### SinglePost.svelte

Displays a single post (an indiidual transformed and rendered markdown file):

```svelte
<script lang="ts">
    import '$lib/styles/code-prism-night-owl.css'; // theme for code blocks
    export let postContent;

    const { title, dateFormatted, escapedContent } = postContent;
</script>

<article>
    <h1>{title}</h1>
    <p>Posted on {dateFormatted}</p>
    {@html escapedContent}
</article>
```

#### TagCloud.svelte

Displays a list of all tags present in all markdown files, if any:

```svelte
<!-- script -->
<script lang="ts">
    export let tags: string[] = [];
</script>

<!-- html -->

{#if tags.length === 0}
	<p>No tags yet.</p>
{/if}

<ul>
    {#each tags as tag}
        <li><a href="tags/{tag}">{tag}</a></li>
    {/each}
</ul>
```

### lib/functions

Auxiliary functions.

#### FormatDate.ts

Async function that takes a date as a string, converts to a date object and formats it to `dd mmm yy`, eg `24 Jul 23```

```typescript
export async function formatDate(date: string): Promise<string> {
    const dateObject = new Date(date); // without this line it throws an TypeError: toLocaleDateString is not a function, which happens when a string is passed instead of a Date object
    const formattedDate = dateObject.toLocaleDateString('en-GB', {
        year: '2-digit',
        day: 'numeric',
        month: 'short'
    });
    return formattedDate;
}
```

#### GetAllTags.ts

Async function that runs through all posts (transformed markdown files) and creates a list of unique tags:

```typescript
import type { Post } from '$lib/types';

export async function getAllTags(Post: Post[]) {
    const allTags: string[] = [];
    Post.forEach((post) => {
        post.metadata.tags.forEach((tag) => {
            if (!allTags.includes(tag)) allTags.push(tag);
        });
    });
    return allTags;
}
```

### lib/styles

CSS for the code block theme. Its long so its compacted here:

<detail>

<summary>code-prism-night-owl.css</summary>

```css
/**
 * MIT License
 * Copyright (c) 2018 Sarah Drasner
 * Sarah Drasner's[@sdras] Night Owl
 * Ported by Sara vieria [@SaraVieira]
 * Added by Souvik Mandal [@SimpleIndian]
 */

 code[class*="language-"],
 pre[class*="language-"] {
     color: #d6deeb;
     font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace;
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

 pre[class*="language-"]::-moz-selection,
 pre[class*="language-"] ::-moz-selection,
 code[class*="language-"]::-moz-selection,
 code[class*="language-"] ::-moz-selection {
     text-shadow: none;
     background: rgba(29, 59, 83, 0.99);
 }

 pre[class*="language-"]::selection,
 pre[class*="language-"] ::selection,
 code[class*="language-"]::selection,
 code[class*="language-"] ::selection {
     text-shadow: none;
     background: rgba(29, 59, 83, 0.99);
 }

 @media print {
     code[class*="language-"],
     pre[class*="language-"] {
         text-shadow: none;
     }
 }

 /* Code blocks */
 pre[class*="language-"] {
     padding: 1em;
     margin: 0.5em 0;
     overflow: auto;
 }

 :not(pre) > code[class*="language-"],
 pre[class*="language-"] {
     color: white;
     background: #011627;
 }

 :not(pre) > code[class*="language-"] {
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

 /* addition */
 .remark-code-title {
    color: red;
 }
```

</detail>

### types

I arranged my types with an index for convenient importing to other files. There are other types in the app, but only postData is relevant here:

#### index.ts

```typescript
// postData
export * from './posts';
```

#### posts.ts

```typescript
export interface Content {
	html: string;
	css: { code: string; map: null };
	head: string;
}

export interface Metadata {
	title: string;
	description: string;
	date: string;
	tags: string[];
}
export interface RawPost {
	metadata: Metadata;
	default: {
		render: () => Content;
	};
}

export interface PostData {
	title: string;
	dateFormatted: string;
	tags: string[];
	escapedContent: string;
}

export interface Post {
	slug: string;
	metadata: Metadata;
	path: string;
	date: string;
	dateFormatted: string;
	escapedContent: string;
}
```

### routes/api/posts

SvelteKit allows creation of API routes by [adding HTTP verbs (eg GET) to a `+server.ts` file](https://kit.svelte.dev/docs/routing#server). It doesn't need to be in an `api` folder.

#### +server.ts

This file is based on [Josh Collinsworth's post on mdsvex and SvelteKit blogs](https://joshcollinsworth.com/blog/build-static-sveltekit-markdown-blog). I've altered it to reflect the batch processing of mdsvex files, and to escape svelte syntax in the mdsvex content.

```typescript
import { json } from '@sveltejs/kit';
import { formatDate } from '$lib/functions/FormatDate';
import type { RawPost, Post, Metadata, Content } from '$lib/types';
import { error } from '@sveltejs/kit';
import { escapeSvelte } from 'mdsvex';

async function getPost() {
	const allFiles = import.meta.glob('/src/routes/posts/**/*.md');
	const iterableFiles = Object.entries(allFiles);

	const Post: Post[] = await Promise.all(
		iterableFiles.map(async ([path, resolver]) => {

			const rawPost = await resolver() as RawPost;
			if (!rawPost) throw error(404, { message: `No post found in ${path}` });

			const metadata: Metadata = rawPost.metadata;
			if (!metadata) throw error(404, { message: `No metadata found in ${path}` });

			// extract and format body text (content) by calling render()
			const content: Content = rawPost.default.render();
			if (!content) throw error(404, { message: `No content found in ${path}` });

			// escape svelte syntax
			const escapedContent = escapeSvelte(content?.html);

			const slug: string = path.split(']/')?.pop()?.split('.').shift() ?? '';
			if (!slug) throw error(404, { message: `No slug found in ${path}` });

			const date = metadata.date;
			if (!date) throw error(404, { message: `No date found in ${path}` });

			const dateFormatted: string = await formatDate(date);
			return {
				slug,
				metadata,
				path,
				date,
				dateFormatted,
				escapedContent
			};
		})
	);

	return Post;
}

export const GET = async () => {
	const Post: Post[] = await getPost();

	const sortedPosts = Post.sort((a, b) => {
		return +new Date(b.date) - +new Date(a.date); // the + operator converts the date to a number by calling getTime(), which returns a unix timestamp
	});
	return json(sortedPosts);
};


```

##### walkthrough

- imports:

  - ```import { json } from '@sveltejs/kit';```

    - [json is a sveltekit module](https://kit.svelte.dev/docs/modules#sveltejs-kit-json) that creates a JSON Response from the supplied data.

  - ```import { formatDate } from 'lib/functions/FormatDate';```

    - This is the formatDate function above

  - ```import type { RawPost, Post, Metadata, Content } from 'lib/types';```

    - type imports, detailed above

  - ```import { error } from '@sveltejs/kit';```

    - [sveltekit's srror function](https://kit.svelte.dev/docs/modules#sveltejs-kit-error)

- async function getPost()

  - ```const allFiles = import.meta.glob('/src/routes/posts/**/*.md');```

    - ```allFiles``` calls [vite's glob import](https://vitejs.dev/guide/features.html#glob-import) to bulk-import markdown files from all subfolders of ```src/routes/posts/```

  - ```const iterableFiles = Object.entries(allFiles);```

    - iterableFiles then calls [the Object.entries() static method](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries) to return an array of keys-value pairs, for example:

    ```javascript
    const object1 = {
     a: 'somestring',
     b: 42
    };

    console.log(object1)
    // > Object { a: "somestring", b: 42 }
    console.log(Object.entries(object1))
    // > Array [Array ["a", "somestring"], Array ["b", 42]]
    ```

-    ```const Post = await Promise.all(```

  - Post calls the [static method Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all), which takes an iterable of promises as a input and returns a single Promise. This promise fulfills when all of the input's promises fulfill, and rejects when and of the input's promises rejects.
  - In other words, Post will return a single promise only if all the promises called within it successfully resolve.

- ```iterableFiles.map(async ([path, resolver]) => {```

  - the [map array method](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) creates a new array based on the calling function passed in
  - vite glob imports loads each file as a file path and a function, here called ```resolver``` (by Josh Collinsowrth in his post, and I've kept as it makes sense). Glob import's syntax is:

  ```javascript
  // code produced by vite
  const modules = {
    './dir/foo.js': () => import('./dir/foo.js'),
    './dir/bar.js': () => import('./dir/bar.js'),
  }
  ```

        So here, ```path = './dir/foo.js'```, and ```resolver = () => import('./dir/foo.js'```

- the body of the map function calls resolver to access data and shapes the output data, with error messages if items not found

```javascript
            const rawPost = await resolver() as RawPost;
			if (!rawPost) throw error(404, { message: `No post found in ${path}` });

			const metadata: Metadata = rawPost.metadata;
			if (!metadata) throw error(404, { message: `No metadata found in ${path}` });

			// extract and format body text (content) by calling render()
			const content: Content = rawPost.default.render();
			if (!content) throw error(404, { message: `No content found in ${path}` });

			// escape svelte syntax
			const escapedContent = escapeSvelte(content?.html);

			const slug: string = path.split(']/')?.pop()?.split('.').shift() ?? '';
			if (!slug) throw error(404, { message: `No slug found in ${path}` });

			const date = metadata.date;
			if (!date) throw error(404, { message: `No date found in ${path}` });
```

- key to note here is escapeSvelte, which isn't mentioned in the mdsvex docs but is essential. Delving into the [mdsvex code on GitHub](https://github.com/pngwn/MDsveX/blob/26591be63e088f57c78108553813ef18cc8ca5b1/packages/mdsvex/src/transformers/index.ts#L572), we find that it's a function that escapes svelte syntax in the html output:

```typescript
// escape curlies, backtick, \t, \r, \n to avoid breaking output of {@html `here`} in .svelte
export const escape_svelty = (str: string): string =>
	str
		.replace(
			/[{}`]/g,
			//@ts-ignore
			(c) => ({
				'{': '&#123;',
				'}': '&#125;',
				'`': '&#96;'
			}[c])
		)
		.replace(/\\([trn])/g, '&#92;$1');
```
    This replaces the characters ```{```, ```}```, and ` with their html entity equivalents, and adds a backslash to escape \t, \r, and \n.

- then there is a return statement from ```Post```, and finally Post itself is returned from ```getPost```:

  ```javascript
              return {
                  slug,
                  metadata,
                  path,
                  date,
                  dateFormatted
              };
          })
      );

      return Post;
  }
  ```

The second function declares this to be an API [GET endpoint](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET), calls getPost, sorts them by date and returns a a json of the pots sorted by date:

```typescript
export const GET = async () => {
    const Post: Post[] = await getPost();

    const sortedPosts = Post.sort((a, b) => {
        return +new Date(b.date) - +new Date(a.date); // the + operator converts the date to a number by calling getTime(), which returns a unix timestamp
    });
    return json(sortedPosts);
};
```

### /[...slug]

The square bracket notation here denotes a dynamic route, and the ... denotes a [rest parameter](https://kit.svelte.dev/docs/advanced-routing#rest-parameters).

#### Static routes
Given 3 pages, the static routing method to access ```blog/one```, ```blog/two``` and ```blog/three``` would be:

```bash
.
blog
    ├── one
    │   └── +page.svelte
    ├── two
    │   └── +page.svelte
    └── three
        └── +page.svelte
```

#### Dynamic routes
Where a dynamic route allows route createion from dynamic data, meaning the routes do not need to be defined ahead of time:

```bash
.
blog
    └── [slug]
        ├── one.md
        ├── two.md
        ├── three.md
        └── +page.svelte

```

#### Rest parameters


The [rest parameter is a special kind of parameter that allows us to represent an indefinite number of arguments as an array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters). The syntax for a rest parameter is three dots followed by the name of the array that will contain the rest of the arguments. In this case, the array is called ```slug```.

<detail><summary>JS example of rest parameters from MDN</summary>
A function definition's last parameter can be prefixed with ... (three U+002E FULL STOP characters), which will cause all remaining (user supplied) parameters to be placed within an Array object.

```javascript
function myFun(a, b, ...manyMoreArgs) {
  console.log("a", a);
  console.log("b", b);
  console.log("manyMoreArgs", manyMoreArgs);
}

myFun("one", "two", "three", "four", "five", "six");

// Console Output:
// a, one
// b, two
// manyMoreArgs, ["three", "four", "five", "six"]
```
</detail>

```bash
.
blog
    └── [...slug]
        ├── one.md
        ├── subfolder
        │   ├── one.md
        │   └── two.md
        ├── anotherSubfolder
        │   ├── one.md
        │   └── two.md
        └── +page.svelte
```

Here, the rest parameter is used to match any number of child routes, and the ```slug``` array will contain the path segments. So for example, ```blog/one``` will match the first route, and ```blog/subfolder/one``` will match the second route.


So, we know the [...slug] is a dynamic route with rest parameter. It has 2 files: one that generates the data serverside, and one that renders clientside:

#### +page.server.ts



also have another go at proper import syntax

```typescript
import type { PageServerLoad } from './$types';
import type { PostData } from '$lib/types';

export const load: PageServerLoad = async ({ parent, params }) => {
	// access sortedPosts from parent layout
	const { sortedPosts } = await parent();
	// find post by slug
	const post = sortedPosts.find((post) => post.slug === params.slug);
	if (!post) {
		return {
			status: 404
		};
	}
	// extract metadata
	const { title, tags } = post.metadata;
	// extract dateFormatted and escapedContent
	const { dateFormatted, escapedContent } = post;

	// create post object from content, title, date
	const postData: PostData = {
		escapedContent,
		title,
		tags,
		dateFormatted
	};

	return {
		postData
	};
};


```

##### walkthrough

1. imports.

   Type ```PageServerLoad``` is imported from [sveltekit's generated types](https://kit.svelte.dev/docs/types#public-types-serverload).


2. ```load``` function

   - ```export const load: PageServerLoad = async ({ parent, params }) => {```: the function is defined as type ```PageServerLoad```, is async, and takes in:
     - [params](https://kit.svelte.dev/docs/load#using-url-data-params). Params is defined form the url visited and so tells the load function which markdown file to load
     - [parent](https://kit.svelte.dev/docs/load#using-parent-data), an async sveltekit function that returns the data from the parent layout. In this case, the parent layout is ```src/routes/blog/index.svelte```, which is where the ```sortedPosts``` data is defined.

   - ```const { sortedPosts } = await parent();``` extracts ```sortedPosts``` from the parent layout

    - ```const post = sortedPosts.find((post) => post.slug === params.slug);``` finds the post with the matching slug

    - ```if (!post) { return { status: 404 }; }``` returns a 404 error if no post is found

    - ```const { dateFormatted, escapedContent } = post;``` extracts ```dateFormatted``` and ```escapedContent``` from post

   - finally, a ```postData``` object is assembled and returned

#### +page.svelte

```typescript
<script>
	import SinglePost from '$lib/components/SinglePost.svelte';
	import TagCloud from '$lib/components/TagCloud.svelte';
	export let data;
	// destructure props and create postContent object
	const { escapedContent, title, dateFormatted, tags } = data.postData || {};
	const postContent = { title, dateFormatted, escapedContent };

</script>

<SinglePost {postContent} />

{#if tags?.length}
	<h2>Posted in:</h2>
	<TagCloud {tags} />
{/if}


```

##### walkthrough

1. ```SinglePost``` and ```TagCloud``` components are imported

2. ```export let data``` creates data prop

3. ```const { content, title, dateFormatted, tags } = data.postData || {};``` destructures ```postData``` from the server file, with a fallback of an empty object

4. ```const body = content.html;``` extracts html from ```content```

5. ```const postContent = { title, dateFormatted, body };``` creates a ```postContent``` object

6. ```<SinglePost {postContent} />``` passes ```postContent``` to ```SinglePost``` to render the content

7. And finally if there are tags then tags are passed to ```TagCloud``` to render tags.

### tags/[tag]

As with ```[slug]```, the square brackets here denote a dynamic route.

#### +page.server.ts

```typescript
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, parent }) => {
    // extract tag string from params
    const tag: string = params.tag;
    // access sortedPosts from parent layout
    const { sortedPosts } = await parent();

    // filter posts by tag
    const postsByTag = sortedPosts.filter((post) => {
        return post.metadata.tags.includes(tag);
    });

    return {
        tag,
        postsByTag
    };
};
```

Here, a ```load``` function is defined that accepts both [params](https://kit.svelte.dev/docs/load#using-url-data-params) and [parent](https://kit.svelte.dev/docs/load#using-parent-data).

- ```params``` allows access to the route info, here allowing the function to determine the tag being asked for and assigning it to ```tag```: ```const tag: string = params.tag;```

- parent is an async function that allows access to a parent layout's ```load``` funciton (here, ```sortedPosts``` from ```src/routes/+layout.server.ts```):

  ```const { sortedPosts } = await parent();```

  The posts are then filtered by tag and ```postsByTag``` returned along with the ```tag``` itself

#### +page.svelte

```svelte
<script lang="ts">
    import PostListWithPreview from '$lib/components/PostListWithPreview.svelte';
    export let data;
    const { tag, postsByTag } = data;
</script>

<h1>All posts for <span class="tagHeading">{tag}</span></h1>

<PostListWithPreview posts={postsByTag} />

<style>
    .tagHeading {
        text-transform: capitalize;
    }
</style>
```

Here, ```PostListWithPreview``` component is imported, ```export let data``` creates the data prop and ```const { tag, postsByTag } = data``` destructures the imported data.

There is then a heading and ```postsByTag``` is passed to ```PostListWithPreview```.

### main page

And so we come to the actual page and server pages for the blog, or rather ```/posts``` route:

#### +layout.server.ts

```typescript
import type { LayoutServerLoad } from './$types';
import type { Post } from '$lib/types';
import { getAllTags } from '$lib/functions/GetAllTags';

export const load: LayoutServerLoad = async ({ fetch }) => {
    // get all posts, sorted by data
    const response = await fetch(`/api/posts`);
    const sortedPosts: Post[] = await response.json();

    // extract tags
    const allTags = await getAllTags(sortedPosts);

    return {
        allTags,
        sortedPosts
    };
};
```
This layout file is the parent file that both ```[slug]``` and ```[tag]``` pages inherit from.  It defines a ```load``` function that makes a [fetch request using sveltekit's modified fetch method](https://kit.svelte.dev/docs/load#making-fetch-requests) request to the internal ```/api/posts``` defined in ```/api/posts/+server.ts```, which returns a list of all posts with slug, metadata, path, date as input into frontmatter and formatted, sorted into date order: ```const response = await fetch('/api/posts');```and calls [Response: json()](https://developer.mozilla.org/en-US/docs/Web/API/Response/json)```const sortedPosts: Post[] = await response.json();```to read the Response stream to completion and resolve to json.

```const allTags = await getAllTags(sortedPosts);``` then calls ```getAllTags``` to make a list of unique tags and ```allTags``` and ```sortedPosts``` are returned.

#### +page.svelte

```svelte
<script lang="ts">
    //  types
    import type { PageData } from './$types';
    //  components
    import PostListWithPreview from '$lib/components/PostListWithPreview.svelte';
    import TagCloud from '$lib/components/TagCloud.svelte';

    //  data
    export let data: PageData;
    const {sortedPosts, allTags} = data;

</script>


<sortedPosts posts={sortedPosts} />
<TagCloud tags={sortedPosts} />
```

Finally a simple one - the type ```PageData``` and components ```PostListWithPreview``` and ```TagCloud```are imported. ```data``` prop is created, and ```sortedPosts``` and ```allTags``` destructured from it.

Outside the ```script``` element, ```sortedPosts``` is passed to ```sortedPosts``` and ```sortedPosts``` is passed to ```TagCloud```.

### test.md

A markdown file I used to test rendering. If of interest:

```markdown
    ---
    title: Test
    description: This is a test
    date: 2023-07-24
    tags:
        - test
        - test2
        - this_site
    ---

    ## Call me a test

    - beep

    1. numbers
    2. more
    3. more


    A link! [link](http://google.com)

    Code!

    ```javascript:test.js
    const test = 'test';
    const test2 = 'test2';
    const test + test2 = 'test3';
    ```

    ```typescript:TSturn.ts
    var test:string = 'test';
    ```

    ```python:snake.py
    test = 'test'
    ```
```

## Notes

### Code lines

Absolutely essential to getting this to work is demarcating inline code with triple backticks (&#96;&#96;&#96;code&#96;&#96;&#96;), as opposed to single (&#96;code&#96;).

### Styling code blocks

mdsvex automatically creates [code blocks with syntax highlighting](https://mdsvex.pngwn.io/docs#highlight), but with no theme. So:

1. Pick a theme from the [Prism.js catalogue](https://github.com/PrismJS/prism-themes/)
2. I created ```src/lib/styles/code-prism-night-owl.css``` and pasted the theme in from the GitHub repo.
3. Import in the script tag of ```src/posts/[slug]/+page.svelte```:
   ```import '$lib/styles/code-prism-night-owl.css';```
4. I wanted to show code titles, so I installed [remark code titles](https://www.npmjs.com/package/remark-code-titles) as [mdsvex can use remark plugins](https://mdsvex.pngwn.io/docs/#remarkplugins--rehypeplugins): ```pnpm add remark-code-titles```
5. I updated my ```svelte.config.js` to import remark-code-titles: ```import codeTitle from 'remark-code-titles';```
6. and updated my config to include remark code titles as an mdsvex plugin

```javascript:svelte.config.js
// imports

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: [
        vitePreprocess(),
        mdsvex(
        { extensions: ['.md'],
        remarkPlugins: [codeTitle]
    })
    ],
    extensions: ['.svelte', '.md'],
    kit: {
        adapter: adapter()
    }
};
```

7. This separates out code titles when placed immediately after language declarations in code fences, eg: `javascript:svelte.config.js`
8. I now added a selector to ``code-prism-night-owl.css``` to style the code title:

```css:code-prism-night-owl.css
<!--all the styles-->
.remark-code-title {
color: red;
}
```