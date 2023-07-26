/* This sets session data in $page store so it is available to all routes via a session object in $page.data */

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	return {
		session: await event.locals.getSession()
	};
};
