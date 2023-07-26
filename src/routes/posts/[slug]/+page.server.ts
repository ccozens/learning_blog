import type { PageServerLoad } from './$types';
import { formatDate } from '$lib/functions/FormatDate';
import type { PostData } from '$lib/types';

// add error handling
export const load: PageServerLoad = async ({ params }) => {
	const post = await import(`../${params.slug}.md`);
	const { title, date, tags } = post.metadata;
	const content = await post.default.render();
    const dateFormatted = await formatDate(date);

	// create post object from content, title, date
	const postData: PostData = {
		content,
		title,
		tags,
		dateFormatted
	};

	return {
		postData
	};
};
