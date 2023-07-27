import type { LayoutServerLoad } from './$types';
import type { AllPosts } from '$lib/types';
import { getAllTags } from '$lib/functions/GetAllTags';

export const load: LayoutServerLoad = async ({ fetch }) => {
	// get all posts, sorted by data
	const response = await fetch(`/api/posts`);
	const sortedPosts: AllPosts[] = await response.json();

	// extract tags
	const allTags = await getAllTags(sortedPosts);

	return {
		allTags,
		sortedPosts
	};
};
