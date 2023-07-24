import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkFrontmatter from 'remark-frontmatter';
import remarkParseFrontmatter from 'remark-parse-frontmatter';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkToc from 'remark-toc';

const processor = unified()
	.use(remarkParse)
	.use(remarkFrontmatter, ['yaml'])
	.use(remarkParseFrontmatter, { type: 'yaml', marker: '-' })
	.use(remarkGfm)
	.use(remarkRehype)
	.use(remarkToc)
	.use(rehypeStringify);

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
