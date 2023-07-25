import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	console.log(params);

	return {};
};
