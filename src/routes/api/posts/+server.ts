import { json } from '@sveltejs/kit';
import { formatDate } from '$lib/functions/FormatDate';
import type { AllPosts, Metadata } from '$lib/types';
import { error } from '@sveltejs/kit';

async function getAllPosts() {
	const allFiles = import.meta.glob('/src/routes/posts/**/*.md');
	const iterableFiles = Object.entries(allFiles);

	const allPosts = await Promise.all(
		iterableFiles.map(async ([path, resolver]) => {
			const { metadata } = (await resolver()) as Metadata;
			if (!metadata) throw error(404, { message: `No metadata found in ${path}` });
			const slug: string = path.split('/')?.pop()?.split('.').shift() ?? '';
			if (!slug) throw error(404, { message: `No slug found in ${path}` });
			const date = metadata.date;
			if (!date) throw error(404, { message: `No date found in ${path}` });
			const dateFormatted: string = await formatDate(date);

			return {
				slug,
				metadata,
				path,
				date,
				dateFormatted
			};
		})
	);

	return allPosts;
}

export const GET = async () => {
	const allPosts: AllPosts[] = await getAllPosts();

	const sortedPosts = allPosts.sort((a, b) => {
		return +new Date(b.date) - +new Date(a.date); // the + operator converts the date to a number by calling getTime(), which returns a unix timestamp
	});
	return json(sortedPosts);
};
