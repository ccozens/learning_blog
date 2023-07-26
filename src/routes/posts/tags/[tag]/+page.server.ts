import type { PageServerLoad } from './$types';
import type { AllPosts } from '$lib/types';

export const load: PageServerLoad = async ({ params, parent }) => {
	// extract tag string from params
	const tag: string = params.tag;
	// access sortedPosts from parent layout
	const {sortedPosts} = await parent();

	// filter posts by tag
	const postsByTag = sortedPosts.filter((post) => {
		return post.metadata.tags.includes(tag);
	});

	return {
		tag,
		postsByTag
	};
};
