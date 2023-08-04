import { json } from '@sveltejs/kit';
import { formatDate } from '$lib/functions/FormatDate';
import type { Post, Metadata, Content } from '$lib/types';
import { error } from '@sveltejs/kit';
import { escapeSvelte } from 'mdsvex';

async function getPost() {
	const allFiles = import.meta.glob('/src/routes/posts/**/*.md');
	const iterableFiles = Object.entries(allFiles);

	const Post = await Promise.all(
		iterableFiles.map(async ([path, resolver]) => {
			const { metadata } = (await resolver()) as Metadata;
			if (!metadata) throw error(404, { message: `No metadata found in ${path}` });
			// extract and format body text (content) by calling render()
			const content: Content = (await resolver())?.default.render();
			// escape svelte syntax
			const escapedContent = escapeSvelte(content?.html);
			if (!content) throw error(404, { message: `No content found in ${path}` });

			const slug: string = path.split(']/')?.pop()?.split('.').shift() ?? '';
			if (!slug) throw error(404, { message: `No slug found in ${path}` });

			const date = metadata.date;
			if (!date) throw error(404, { message: `No date found in ${path}` });

			const dateFormatted: string = await formatDate(date);
			return {
				slug,
				metadata,
				path,
				date,
				dateFormatted,
				escapedContent
			};
		})
	);

	return Post;
}

export const GET = async () => {
	const Post: Post[] = await getPost();

	const sortedPosts = Post.sort((a, b) => {
		return +new Date(b.date) - +new Date(a.date); // the + operator converts the date to a number by calling getTime(), which returns a unix timestamp
	});
	return json(sortedPosts);
};
