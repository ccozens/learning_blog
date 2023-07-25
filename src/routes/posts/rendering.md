---
title: Rendering markdown
description: Using remark and rehype to render svelte pages from markdown
date: 2023-07-25
tags:
    - markdown
    - learning
    - this_site
---

I have chosen to render markdown using the [unified ecosystem](https://unifiedjs.com), which consists a core module that acts as an interface to convert markdown into structured data ([syntax trees](https://github.com/syntax-tree)), and so make it available to plugins as a consistent datatype. Three signficant ecosystems within unified are [remark  for markdown](https://unifiedjs.com/explore/project/remarkjs/remark/), [rehype for HTML](https://unifiedjs.com/explore/project/rehypejs/rehype/), and [retext for natural language](https://unifiedjs.com/explore/project/retextjs/retext/).