export interface PostData {
	content: {
		html: string;
		css: { code: string; map: null };
		head: string;
	};
	title: string;
	dateFormatted: string;
}

export interface Metadata {
	metadata: {
		title: string;
		description: string;
		date: string;
		categories: string[];
	};
}

export interface AllPosts {
	slug: string;
	metadata: {
		title: string;
		description: string;
		date: string;
		categories: string[];
	};
	path: string;
	date: string;
	dateFormatted: string;
}
