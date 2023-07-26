import type { PageServerLoad } from './$types';
import type { AllPosts } from '$lib/types';

export const load: PageServerLoad = async ({ fetch }) => {
	const response = await fetch(`/api/posts`);
	const sortedPosts: AllPosts[] = await response.json();

	return {
		sortedPosts
	};
};
