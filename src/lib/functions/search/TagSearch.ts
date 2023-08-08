import type { Tag } from '$lib/types';

export function tagSearch(tags: Tag[], search: string): Tag[] {
	return tags.filter((tag) => {
		if (search === '') {
			return true;
		}
		return tag.name.toLowerCase().includes(search.toLowerCase());
	});
}
