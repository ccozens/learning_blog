import type { Post } from '$lib/types';

export async function getAllTags(Post: Post[]) {
	const allTags: string[] = [];
	Post.forEach((post) => {
		post.metadata.tags.forEach((tag) => {
			if (!allTags.includes(tag)) allTags.push(tag);
		});
	});
	return allTags;
}
