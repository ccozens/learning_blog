import type { PageServerLoad } from './$types';
import type { AllPosts } from '$lib/types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	// extract tag string from params
	const tag: string = params.tag;
	const response = await fetch(`/api/posts`);
	const allPosts: AllPosts[] = await response.json();

	// filter posts by tag
	const postsByTag = allPosts.filter((post) => {
		return post.metadata.tags.includes(tag);
	});

	return {
		tag,
		postsByTag,
		allPosts
	};
};
