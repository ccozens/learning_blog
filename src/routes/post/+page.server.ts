import type { PageServerLoad } from '../$types';


// test markdown rendering
import { renderMarkdown } from '$lib/functions/RenderMarkdown';



export const load:PageServerLoad = async ( { fetch} ) => {
	const file = await fetch(`src/lib/functions/test.md`);
	const markdown = await file.text();
	const data = await renderMarkdown(markdown);

	return {
		frontmatter: data.frontmatter,
		html: data.html
	}
}
