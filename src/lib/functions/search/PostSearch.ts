import type { Post } from '$lib/types';

export function postSearch(posts: Post[], normalizedSearch: string): Post[] {
	const searchResult: Post[] = [];

	posts.forEach((post) => {
		// stringify post
		const postString = JSON.stringify(post);
		// search string for search term
		if (postString.toLowerCase().includes(normalizedSearch)) {
			searchResult.push(post);
		}
	});

	return searchResult;
}
