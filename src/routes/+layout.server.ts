import type { LayoutServerLoad } from './$types';
import { getAllPaths } from '$lib/functions/GetAllPaths';

export const load: LayoutServerLoad = async (event) => {
	// load path data
	const navItems = await getAllPaths();
	return {
		/* This sets session data in $page store so it is available to all routes via a session object in $page.data */
		session: await event.locals.getSession(),
		navItems
	};
};
