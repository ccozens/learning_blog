// import type { LayoutServerLoad } from './$types';
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
