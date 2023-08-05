export interface Content {
	html: string;
	css: { code: string; map: null };
	head: string;
}

export interface Metadata {
	title: string;
	description: string;
	date: string;
	tags: string[];
}
export interface RawPost {
	metadata: Metadata;
	default: {
		render: () => Content;
	};
}

export interface PostData {
	title: string;
	dateFormatted: string;
	tags: string[];
	escapedContent: string;
}

export interface Post {
	slug: string;
	metadata: Metadata;
	path: string;
	date: string;
	dateFormatted: string;
	escapedContent: string;
}
