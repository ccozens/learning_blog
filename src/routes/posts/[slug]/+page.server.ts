import type { PageServerLoad } from './$types';
import type { RawPost, Content, PostData } from '$lib/types';
import { formatDate } from '$lib/functions/FormatDate';



export const load: PageServerLoad = async ({ params }) => {
	// import post file
	const post: RawPost = await import(`../${params.slug}.md`);
	// extract metadata
	const { title, date, tags } = post.metadata;
	// extract and format body text (content)
	const content: Content = post.default.render();
	// format date
	const dateFormatted = await formatDate(date);

	// create post object from content, title, date
	const postData: PostData = {
		content,
		title,
		tags,
		dateFormatted,
	};

	return {
		postData,
	};
};
