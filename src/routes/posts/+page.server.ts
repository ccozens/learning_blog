import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const response = await fetch(`/api/posts`);
	const sortedPosts = await response.json();

	return {
		sortedPosts
	};
};
