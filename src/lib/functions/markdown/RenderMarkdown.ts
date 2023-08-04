
import { unified } from 'unified'; // core interface
import remarkParse from 'remark-parse'; // parse markdown to mdast
import remarkFrontmatter from 'remark-frontmatter'; // separate frontmatter
import remarkParseFrontmatter from 'remark-parse-frontmatter'; // parse frontmatter
import remarkGfm from 'remark-gfm'; // gfm support
import rehypePrism from 'rehype-prism-plus'; // syntax highlighting
import remarkRehype from 'remark-rehype'; // mdast to hast
import rehypeStringify from 'rehype-stringify'; // hast to html

import type { Frontmatter } from '$lib/types';

const processor = unified()
	.use(remarkParse)
	.use(remarkFrontmatter, ['yaml'])
	.use(remarkParseFrontmatter, { type: 'yaml', marker: '-' })
	.use(remarkGfm)
	.use(remarkRehype)
	.use(rehypeStringify)
	.use(rehypePrism, { showLineNumbers: true });


function isFrontmatter(obj: unknown): obj is Frontmatter {
	const fm = obj as Frontmatter;
	return (
		typeof fm.title === 'string' &&
		typeof fm.description === 'string' &&
		Array.isArray(fm.tags) &&
		fm.tags.every((tag) => typeof tag === 'string')
	);
}

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
