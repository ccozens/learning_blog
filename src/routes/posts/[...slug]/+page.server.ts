// import type { LayoutServerLoad } from './$types';
import type { PageServerLoad } from './$types';
import type { RawPost, Content, PostData } from '$lib/types';
import { formatDate } from '$lib/functions/FormatDate';
import { escapeSvelte } from 'mdsvex';


export const load: PageServerLoad = async ({ params }) => {
// export const load: LayoutServerLoad = async ({ params }) => {
	// import post file
	const post: RawPost = await import(`./${params.slug}.md`);
	console.log('params.slug', params.slug);
	// extract metadata
	const { title, date, tags } = post.metadata;
	// extract and format body text (content)
	const content: Content = post.default.render();
	// escape svelte syntax
	const escapedContent = escapeSvelte(content.html);
	// format date
	const dateFormatted = await formatDate(date);

	// create post object from content, title, date
	const postData: PostData = {
		escapedContent,
		title,
		tags,
		dateFormatted,
	};

	return {
		postData,
	};
};
