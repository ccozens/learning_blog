---
title: 'Rendering markdown with mdsvex'
date: '2023-07-31'
description: description
tags:
    - sveltekit
    - learning_blog
    - markdown
---


1. imports.

Type `PageServerLoad` is imported from [sveltekit's generated types](https://kit.svelte.dev/docs/types#public-types-serverload).

Types `RawPost, Content, PostData` are defined types imported locally.

`formatDate` is a function (described above) to format the date.

Of note is `RawPost`, which specifies that the render function will return data of structure `Content`.

2. `load` function

- ```export const load: PageServerLoad = async ({ params }) => {```: the function is defined as type `PageServerLoad`, is async, and takes in [params](https://kit.svelte.dev/docs/load#using-url-data-params). Params is defined form the url visited and so tells the load function which markdown file to load

- ```const post: RawPost = await import(`../${params.slug}.md`);```: the file is imported based on params

- ```const { title, date, tags } = post.metadata;``` : title, data and tags are assigned from imported metadata

- ```const content: Content = post.default.render();``` : Sveltekit's render funciton is called to parse the markdown into HTML and CSS.

- ```const dateFormatted = await formatDate(date);``` : the date is formatted

- finally, a `postData` object is assembled and returned