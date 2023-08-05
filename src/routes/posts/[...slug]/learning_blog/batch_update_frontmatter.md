---
title: 'Batch update frontmatter'
date: '2023-07-31'
description: Node script to add frontmatter to markdown files
tags:
    - sveltekit
    - learning_blog
    - markdown
    - javascript
---

## Why?

I started keeping markdown notes while taking courses and developing this blog, that I wanted as a learning resource. Rather than try to second-guess the final yaml frontmatter structure I would want, I left them blank and figured I can run a script to batch-update when finished.

## How?

Develop and run a script that will:

-   create frontmatter in the format:

---

title:

description:

date: yyyy-mm-dd

tabs:

- tag1

- tag2

-   extract the top level heading from the file and (1) set it as title (2) convert to second level heading

-   if it is a link, extract the text only (not the URL)

-   set date as the date the file was last updated

-   set description to 'description'

-   allow input params, so I can choose input direcory and set custom tags.

### What?

Here it is:

```javascript
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const moment = require('moment');

// Define the input and output directories
const outputDir = './output';

// Get input directory and tags from command line arguments
const inputDir = process.argv[2];
const inputTags = process.argv.slice(3);

// Set input dir path and check if input directory exists
if (!fs.existsSync(inputDir)) {
	throw new Error(`Input directory '${inputDir}' not found`);
}

// Set output dir path and create output directory if it doesn't exist
// const outputDirPath = path.join(outputDir, inputDirName);
if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir);
}

// Read all files in the input directory
const files = fs.readdirSync(inputDir);
// Filter for markdown and throw error if no .md files found
const mdFiles = files.filter((file) => path.extname(file) === '.md');
if (mdFiles.length === 0) {
	throw new Error(`No .md files found in input directory '${inputDir}'`);
}

// Loop through each file and process them, keeping count
let count = 0;
mdFiles.forEach((file) => {
	// Read the input file
	const inputPath = path.join(inputDir, file);
	const inputContent = fs.readFileSync(inputPath, 'utf8');

	// Parse the input file using gray-matter
	let { content, data } = matter(inputContent);

	// Extract the title from the first heading, first looking for '# Title' and then '#Title'
	let title = data.title ? data.title : '';
	const titleMatch = content.match(/^#\s+(.*)$/m) ?? content.match(/^#(.*)$/m);

	if (titleMatch) {
		// generate frontmatter title: from h1 and remove link if present
		const heading = titleMatch[1];
		// If the heading is a link, then extract the text only and set as title
		if (heading.startsWith('[') && heading.endsWith(')')) {
			const headingText = heading.substring(1, heading.indexOf(']'));
			title = headingText;
		} else {
			// if heading wasn't a link, then set the heading as title
			title = heading;
		}
	}

	// Set the date to the last modified time of the file
	const stats = fs.statSync(inputPath);
	const date = moment(stats.mtime).format('YYYY-MM-DD');

	// Set the description
	const description = 'description';
	// Set tags to provided tags or "todo"
	const tags = inputTags.length > 0 ? inputTags : ['todo'];
	// note that inputTags is always present, so without the length test this returns an empty array if no tags give, and that doesn't format properly
	// Generate the output content with front matter
	const newFrontMatterData = { title, date, description, tags };
	const outputContent = data
		? matter.stringify(content, newFrontMatterData, {
				orig: data.orig
		  })
		: matter.stringify(content, newFrontMatterData);

	// Write the output file
	const outputPath = path.join(outputDir, file);
	fs.writeFileSync(outputPath, outputContent);

	// incrememnt the count
	count++;
});

// output number of files processed
console.log(`${count} out of ${mdFiles.length} files processed`);
```

Usage:

`node update-markdown.js

I created a folder called in posts called `reformatting` to put this in, so for example to modify all contents of `posts/astro` I ran:

```bash
node reformatting/update-markdown.js astro astro
```

This created `posts/output` so I could verify the output and customise any tags, then:

```bash
mv -f ./output/* ./astro
```

moved everything in `/output` into `/astro` and overwrote the original files. I had a copy of the original elsewhere in case of crisis.
