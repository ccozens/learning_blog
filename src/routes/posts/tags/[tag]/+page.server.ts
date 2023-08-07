import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, parent }) => {
	// redirect if no tag
	if (!params.tag) {
		throw redirect(307, '/posts');
	}

	// extract tag string from params
	const tag: string = params.tag;
	// access sortedPosts from parent layout
	const { sortedPosts } = await parent();

	// filter posts by tag
	const postsByTag = sortedPosts.filter((post) => {
		return post.metadata.tags.includes(tag);
	});

	return {
		tag,
		postsByTag
	};
};
