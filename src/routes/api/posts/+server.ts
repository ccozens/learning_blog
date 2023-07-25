import { json } from '@sveltejs/kit';
import { formatDate } from '$lib/functions/FormatDate';
import type { AllPosts, Metadata } from '$lib/types';

async function getAllPosts() {
	const allFiles = import.meta.glob('/src/routes/posts/**/*.md');
	const iterableFiles = Object.entries(allFiles);

	const allPosts = await Promise.all(
		iterableFiles.map(async ([path, resolver]) => {
			const { metadata } = (await resolver()) as Metadata;
			const slug: string = path.split('/')?.pop()?.split('.').shift() ?? '';
			const date = metadata.date;
			const dateFormatted: string = await formatDate(date);

			// catch errors
			if (!metadata) throw new Error(`No metadata found in ${path}`);
			if (!slug) throw new Error(`No slug found in ${path}`);
			if (!date) throw new Error(`No date found in ${path}`);

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
