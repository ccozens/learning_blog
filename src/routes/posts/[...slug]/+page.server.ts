// import type { LayoutServerLoad } from './$types';
import type { PageServerLoad } from './$types';
import type { RawPost, Content, PostData } from '$lib/types';
import { formatDate } from '$lib/functions/FormatDate';
import { escapeSvelte } from 'mdsvex';

export const load: PageServerLoad = async ({ parent, params }) => {
/*	// import post file
 	 // ignoring this import because dynamic import is not importing from same folder
	const post: RawPost = await import(`./${params.slug}.md`);
	// extract metadata
	const { title, date, tags } = post.metadata;
	// extract and format body text (content)
	const content: Content = post.default.render();
	// escape svelte syntax
	const escapedContent = escapeSvelte(content.html);


	// format date
	const dateFormatted = await formatDate(date);
	*/

	// access sortedPosts from parent layout
	const { sortedPosts } = await parent();
	// find post by slug
	const post = sortedPosts.find((post) => post.slug === params.slug);
	if (!post) {
		return {
			status: 404,
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
		dateFormatted,
	};

	return {
		postData,
	};
};
