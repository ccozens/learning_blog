import type { PageServerLoad } from './$types';
import type { AllPosts } from '$lib/types';
import { getAllTags } from '$lib/functions/getAllTags';

export const load: PageServerLoad = async ({ fetch, params }) => {
	const response = await fetch(`/api/posts`);
	const allPosts: AllPosts[] = await response.json();

	// extract tags from all posts
	const allTags = await getAllTags(allPosts);

	return { allTags };
};
