import type { PageServerLoad, RouteParams } from './$types';
import type { AllPosts } from '$lib/types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	// export async function load({ fetch, params }) {
	const tag: RouteParams = params;
	const response = await fetch(`/api/posts`);
	const allPosts: AllPosts[] = await response.json();

	const postsByTag = allPosts.filter((post) => {
		return post.metadata.tags.includes(tag);
	});

	return {
		tag,
		postsByTag
	};
};
