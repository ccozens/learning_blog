export interface PostData {
	content: {
		html: string;
		css: { code: string; map: null };
		head: string;
	};
	title: string;
	dateFormatted: string;
	tags: string[];
}

export interface Metadata {
	metadata: {
		title: string;
		description: string;
		date: string;
		tags: string[];
	};
}

import type { RouteParams } from './$types';
export interface AllPosts {
	slug: string;
	metadata: {
		title: string;
		description: string;
		date: string;
		tags: string[] | RouteParams;
	};
	path: string;
	date: string;
	dateFormatted: string;
}
