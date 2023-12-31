import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// redirect to /posts/tag
	throw redirect(307, '/posts/tags');
};
