export interface RawPost {
	metadata: {
		title: string;
		date: string;
		tags: string[];
	};
	default: {
		render: () => Content;
	};
}

export interface PostData {
	escapedContent: string;
	title: string;
	dateFormatted: string;
	tags: string[];
}

export interface Content {
	html: string;
	css: { code: string; map: null };
	head: string;
}
export interface Metadata {
	metadata: {
		title: string;
		description: string;
		date: string;
		tags: string[];
	};
}

export interface Post {
	slug: string;
	metadata: {
		title: string;
		description: string;
		date: string;
		tags: string[];
	};
	path: string;
	date: string;
	dateFormatted: string;
	escapedContent: string;
}
