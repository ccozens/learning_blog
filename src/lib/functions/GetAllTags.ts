import type { Post, Tag } from '$lib/types';

export async function getAllTags(Post: Post[]) {
	const allTags: Tag[] = [];
	Post.forEach((post) => {
		post.metadata.tags.forEach((tag) => {
			const index = allTags.findIndex((t) => t.name === tag);
			if (index === -1) {
				allTags.push({ name: tag, count: 1 });
			} else {
				allTags[index].count++;
			}
		});
	});

	return allTags;
}
