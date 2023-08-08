import type { Post, SearchedPost } from '$lib/types';

// format searchResult for display
export function formatSearchResult(searchResult: Post[], normalizedSearch: string): SearchedPost {
	if (searchResult.length === 0) {
		return {
			titleMatches: [],
			descriptionMatches: [],
			tagMatches: [],
			contentMatches: []
		};
	}
	// searchResult is an array of Post objects
	const titleMatches: Post[] = [];
	const descriptionMatches: Post[] = [];
	const tagMatches: Post[] = [];
	const contentMatches: Post[] = [];

	searchResult.forEach((post) => {
		if (post.metadata.title.toLowerCase().includes(normalizedSearch)) {
			titleMatches.push(post);
		} else if (post.metadata.description.toLowerCase().includes(normalizedSearch)) {
			descriptionMatches.push(post);
		} else if (post.metadata.tags.join(' ').toLowerCase().includes(normalizedSearch)) {
			tagMatches.push(post);
		} else if (post.escapedContent.toLowerCase().includes(normalizedSearch)) {
			contentMatches.push(post);
		}
	});

	// return all object containing {title: titleMatches, descriptin: descriptionMatches, ...}
	return {
		titleMatches: titleMatches,
		descriptionMatches: descriptionMatches,
		tagMatches: tagMatches,
		contentMatches: contentMatches
	};
}
