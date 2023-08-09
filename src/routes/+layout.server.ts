import type { LayoutServerLoad } from './$types';
import { getAllPaths } from '$lib/functions/GetAllPaths';
import { getAllTags } from '$lib/functions/GetAllTags';
import type { Post, Tag } from '$lib/types';

export const load: LayoutServerLoad = async (event) => {
	// destructure fetch function from event
	const { fetch } = event;
	// load path data for nav
	const navItems = await getAllPaths();

	// get all posts, sorted by date
	const response = await fetch(`/api/posts`);
	const sortedPosts: Post[] = await response.json();

	// extract tags for tag cloud
	const allTags: Tag[] = await getAllTags(sortedPosts);

	return {
		/* This sets session data in $page store so it is available to all routes via a session object in $page.data */
		session: await event.locals.getSession(),
		navItems,
		allTags,
		sortedPosts
	};
};
