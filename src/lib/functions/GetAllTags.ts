import type { AllPosts } from '$lib/types';

export async function getAllTags(allPosts: AllPosts[]) {
	const allTags: string[] = [];
	allPosts.forEach((post) => {
		post.metadata.tags.forEach((tag) => {
			if (!allTags.includes(tag)) allTags.push(tag);
		});
	});
	return allTags;
}
