import type { Post } from '$lib/types';

// store all post titles, description and content in an array
export async function getSearchContent(Post: Post[]) {
	const searchContent: PostSearchData[] = [];
	Post.forEach((post) => {
		searchContent.push({
			title: post.metadata.title,
			description: post.metadata.description,
			tags: post.metadata.tags,
			escapedContent: post.metadata.description,
			path: post.slug
		});
	});

	return searchContent;
}
