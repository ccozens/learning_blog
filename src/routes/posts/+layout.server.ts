import type { LayoutServerLoad } from './$types';
import type { Post, Tag } from '$lib/types';
import { getAllTags } from '$lib/functions/GetAllTags';
// import { getSearchContent } from '$lib/functions/GetSearchContent';

export const load: LayoutServerLoad = async ({ fetch }) => {
	// get all posts, sorted by data
	const response = await fetch(`/api/posts`);
	const sortedPosts: Post[] = await response.json();

	// extract tags
	const allTags: Tag[] = await getAllTags(sortedPosts);

	// extract title, description, date, tags and content from each post
	// const searchContent = getSearchContent(sortedPosts);
	return {
		allTags,
		sortedPosts
		// searchContent
	};
};
